package ca.tlcp.ai.hell_os.manager

import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.setValue
import ca.tlcp.ai.hell_os.protocol.AckMsg
import ca.tlcp.ai.hell_os.protocol.CatalogueMsg
import ca.tlcp.ai.hell_os.protocol.CommandDef
import ca.tlcp.ai.hell_os.protocol.CreateKey
import ca.tlcp.ai.hell_os.protocol.ErrorMsg
import ca.tlcp.ai.hell_os.protocol.GetLogs
import ca.tlcp.ai.hell_os.protocol.GetState
import ca.tlcp.ai.hell_os.protocol.KeyCreatedMsg
import ca.tlcp.ai.hell_os.protocol.KeyInfo
import ca.tlcp.ai.hell_os.protocol.KeysMsg
import ca.tlcp.ai.hell_os.protocol.ListKeys
import ca.tlcp.ai.hell_os.protocol.LogEntry
import ca.tlcp.ai.hell_os.protocol.LogsMsg
import ca.tlcp.ai.hell_os.protocol.ManagerToServer
import ca.tlcp.ai.hell_os.protocol.ReportMsg
import ca.tlcp.ai.hell_os.protocol.ResultMsg
import ca.tlcp.ai.hell_os.protocol.RevokeKey
import ca.tlcp.ai.hell_os.protocol.SendCommand
import ca.tlcp.ai.hell_os.protocol.StateMsg
import ca.tlcp.ai.hell_os.protocol.TargetStatus
import ca.tlcp.ai.hell_os.protocol.decodeServerToManager
import ca.tlcp.ai.hell_os.protocol.encode
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Job
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch

enum class LinkStatus { DISCONNECTED, CONNECTING, CONNECTED }

enum class Tone { INFO, GOOD, WARN, BAD }

data class FeedItem(
    val id: Long,
    val at: Long,
    val source: String,
    val text: String,
    val detail: String?,
    val tone: Tone,
)

/**
 * All of the Manager's state and behaviour, independent of the UI.
 * Everything observable is Compose state, so screens simply read it.
 */
class ManagerController(
    private val platform: ManagerPlatform,
    private val scope: CoroutineScope,
) {
    var status by mutableStateOf(LinkStatus.DISCONNECTED)
        private set

    /** True from the moment the user connects until they disconnect (or the first attempt fails). */
    var active by mutableStateOf(false)
        private set

    var lastError by mutableStateOf<String?>(null)
        private set

    var target by mutableStateOf(TargetStatus(online = false))
        private set

    var catalogue by mutableStateOf<List<CommandDef>>(emptyList())
        private set

    var feed by mutableStateOf<List<FeedItem>>(emptyList())
        private set

    var history by mutableStateOf<List<LogEntry>>(emptyList())
        private set

    var historyHasMore by mutableStateOf(false)
        private set

    var keys by mutableStateOf<List<KeyInfo>>(emptyList())
        private set

    /** The secret of a just-created key. Shown once, then dismissed. */
    var newSecret by mutableStateOf<KeyCreatedMsg?>(null)
        private set

    /** Latest status line per command name, e.g. "Done: pong". */
    var commandStatus by mutableStateOf<Map<String, String>>(emptyMap())
        private set

    var nowMs by mutableStateOf(platform.nowMs())
        private set

    val saved: SavedSettings? = platform.loadSettings()

    private var transport: Transport? = null
    private var generation = 0
    private var currentUrl = ""
    private var currentKey = ""
    private var connectedOnce = false
    private var retries = 0
    private var reconnectJob: Job? = null
    private val pending = HashMap<String, String>()
    private var commandCounter = 0L
    private var feedCounter = 0L
    private var historyAppend = false
    private var ticks = 0

    /* ---------------- Connection ---------------- */

    fun connect(url: String, key: String) {
        currentUrl = url.trim()
        currentKey = key.trim()
        platform.saveSettings(SavedSettings(currentUrl, currentKey))

        connectedOnce = false
        retries = 0
        active = true
        openLink()
    }

    fun disconnect() {
        active = false
        reconnectJob?.cancel()
        generation++
        transport?.close()
        transport = null
        status = LinkStatus.DISCONNECTED
        target = TargetStatus(online = false)
        lastError = null
    }

    private fun openLink() {
        reconnectJob?.cancel()
        transport?.close()

        generation++
        val gen = generation

        status = LinkStatus.CONNECTING
        lastError = null

        val link = platform.createTransport()
        transport = link

        link.connect(
            currentUrl,
            currentKey,
            object : Transport.Listener {
                // Callbacks arrive on transport threads: hop onto the UI scope, and ignore
                // anything from a link that has since been replaced.
                override fun onOpen() {
                    scope.launch { if (gen == generation) onOpened() }
                }

                override fun onText(text: String) {
                    scope.launch { if (gen == generation) handle(text) }
                }

                override fun onClosed(reason: String?) {
                    scope.launch { if (gen == generation) onLinkClosed(reason) }
                }
            },
        )
    }

    private fun onOpened() {
        connectedOnce = true
        retries = 0
        status = LinkStatus.CONNECTED
        addFeed("MANAGER", "Connected to the backend", null, Tone.GOOD)
    }

    private fun onLinkClosed(reason: String?) {
        transport = null
        status = LinkStatus.DISCONNECTED
        target = TargetStatus(online = false)
        lastError = reason ?: "Connection closed"

        // A first attempt that fails (wrong URL or key) goes back to the connect screen
        // instead of retrying: hammering the backend with a bad key would get this IP blocked.
        if (!connectedOnce) {
            active = false
            return
        }

        addFeed("BACKEND", "Connection lost: $lastError", null, Tone.BAD)
        scheduleReconnect()
    }

    private fun scheduleReconnect() {
        retries++
        val wait = minOf(30_000L, 3_000L * retries)

        reconnectJob = scope.launch {
            delay(wait)
            if (active && status == LinkStatus.DISCONNECTED) openLink()
        }
    }

    /** Called once a second by the UI: refreshes the clock and keeps the idle connection alive. */
    fun tick() {
        nowMs = platform.nowMs()
        ticks++
        if (status == LinkStatus.CONNECTED && ticks % 20 == 0) send(GetState)
    }

    /* ---------------- Actions ---------------- */

    fun sendCommand(def: CommandDef, args: Map<String, String>) {
        val id = "c${platform.nowMs()}-${commandCounter++}"
        val clean = args.mapValues { it.value.trim() }.filterValues { it.isNotEmpty() }

        pending[id] = def.name
        setCommandStatus(def.name, "Sending...")

        if (send(SendCommand(id, def.name, clean))) {
            addFeed(
                "MANAGER",
                "Sent: ${def.label}",
                clean.entries.joinToString(", ") { "${it.key}=${it.value}" }.ifEmpty { null },
                Tone.INFO,
            )
        } else {
            pending.remove(id)
            setCommandStatus(def.name, "Not connected")
        }
    }

    fun requestHistory(reset: Boolean) {
        historyAppend = !reset
        send(GetLogs(limit = 100, beforeId = if (reset) null else history.lastOrNull()?.id))
    }

    fun requestKeys() {
        send(ListKeys)
    }

    fun createKey(name: String, role: String) {
        send(CreateKey(name.trim(), role))
    }

    fun revokeKey(id: Long) {
        send(RevokeKey(id))
    }

    fun dismissSecret() {
        newSecret = null
    }

    fun clearFeed() {
        feed = emptyList()
    }

    /* ---------------- Incoming ---------------- */

    private fun handle(text: String) {
        val msg = try {
            decodeServerToManager(text)
        } catch (e: Exception) {
            addFeed("BACKEND", "Unreadable message from the backend", e.message, Tone.WARN)
            return
        }

        when (msg) {
            is CatalogueMsg -> catalogue = msg.commands

            is StateMsg -> {
                val wasOnline = target.online
                target = msg.status

                if (wasOnline != msg.status.online) {
                    addFeed(
                        "TARGET",
                        if (msg.status.online) "Target came online" else "Target went offline",
                        null,
                        if (msg.status.online) Tone.GOOD else Tone.BAD,
                    )
                }
            }

            is AckMsg -> {
                val name = pending[msg.id] ?: "command"

                if (msg.accepted) {
                    setCommandStatus(name, "Sent. Waiting for the Target...")
                } else {
                    pending.remove(msg.id)
                    setCommandStatus(name, "Rejected: ${msg.reason ?: "unknown reason"}")
                    addFeed("BACKEND", "Rejected $name", msg.reason, Tone.BAD)
                }
            }

            is ResultMsg -> {
                val name = pending.remove(msg.id) ?: "command"
                setCommandStatus(name, (if (msg.ok) "Done: " else "Failed: ") + msg.message)
                addFeed("TARGET", "$name: ${msg.message}", null, if (msg.ok) Tone.GOOD else Tone.BAD)
            }

            is ReportMsg -> addFeed("TARGET", msg.summary, msg.detail, toneFor(msg.kind), msg.at)

            is LogsMsg -> {
                history = if (historyAppend) history + msg.entries else msg.entries
                historyHasMore = msg.hasMore
            }

            is KeysMsg -> keys = msg.keys

            is KeyCreatedMsg -> newSecret = msg

            is ErrorMsg -> addFeed("BACKEND", msg.message, null, Tone.BAD)
        }
    }

    /* ---------------- Helpers ---------------- */

    private fun send(message: ManagerToServer): Boolean = transport?.send(message.encode()) ?: false

    private fun setCommandStatus(name: String, text: String) {
        commandStatus = commandStatus + (name to text)
    }

    private fun addFeed(
        source: String,
        text: String,
        detail: String?,
        tone: Tone,
        at: Long = platform.nowMs(),
    ) {
        val item = FeedItem(feedCounter++, at, source, text, detail, tone)
        feed = (listOf(item) + feed).take(500)
    }

    private fun toneFor(kind: String): Tone = when {
        kind.contains("dialog") || kind.contains("blocked") -> Tone.WARN
        kind.contains("lost") || kind.contains("error") -> Tone.BAD
        else -> Tone.INFO
    }
}
