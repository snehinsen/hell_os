package ca.tlcp.ai.hell_os.manager

import java.net.URI
import java.net.http.HttpClient
import java.net.http.WebSocket
import java.time.Duration
import java.time.Instant
import java.time.ZoneId
import java.time.format.DateTimeFormatter
import java.util.concurrent.CompletionStage
import java.util.concurrent.Executors
import java.util.prefs.Preferences

/**
 * Desktop implementation: the JDK's built-in WebSocket client (it can send the
 * Authorization header, unlike a browser) and java.util.prefs for remembering the URL and key.
 */
class DesktopPlatform : ManagerPlatform {

    private val prefs: Preferences = Preferences.userRoot().node("ca/tlcp/ai/hell_os/manager")

    private val timeOnly = DateTimeFormatter.ofPattern("HH:mm:ss").withZone(ZoneId.systemDefault())
    private val dateAndTime = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss").withZone(ZoneId.systemDefault())

    override fun createTransport(): Transport = JdkWebSocketTransport()

    override fun nowMs(): Long = System.currentTimeMillis()

    override fun formatTime(epochMs: Long, withDate: Boolean): String =
        (if (withDate) dateAndTime else timeOnly).format(Instant.ofEpochMilli(epochMs))

    override fun loadSettings(): SavedSettings? {
        val url = prefs.get("url", null) ?: return null
        return SavedSettings(url, prefs.get("key", ""))
    }

    override fun saveSettings(settings: SavedSettings) {
        prefs.put("url", settings.url)
        prefs.put("key", settings.key)
    }
}

private class JdkWebSocketTransport : Transport {

    private val client: HttpClient = HttpClient.newBuilder()
        .connectTimeout(Duration.ofSeconds(10))
        .build()

    // WebSocket.sendText must not overlap itself, so every send goes through one thread.
    private val sender = Executors.newSingleThreadExecutor { runnable ->
        Thread(runnable, "hell-ws-send").apply { isDaemon = true }
    }

    @Volatile
    private var socket: WebSocket? = null

    override fun connect(url: String, bearerKey: String, listener: Transport.Listener) {
        try {
            client.newWebSocketBuilder()
                .header("Authorization", "Bearer $bearerKey")
                .connectTimeout(Duration.ofSeconds(10))
                .buildAsync(URI.create(url), object : WebSocket.Listener {
                    private val buffer = StringBuilder()

                    override fun onOpen(webSocket: WebSocket) {
                        socket = webSocket
                        listener.onOpen()
                        webSocket.request(1)
                    }

                    override fun onText(webSocket: WebSocket, data: CharSequence, last: Boolean): CompletionStage<*>? {
                        buffer.append(data)

                        if (last) {
                            val text = buffer.toString()
                            buffer.setLength(0)
                            listener.onText(text)
                        }

                        webSocket.request(1)
                        return null
                    }

                    override fun onClose(webSocket: WebSocket, statusCode: Int, reason: String): CompletionStage<*>? {
                        listener.onClosed("Closed by the backend ($statusCode) $reason".trim())
                        return null
                    }

                    override fun onError(webSocket: WebSocket, error: Throwable) {
                        listener.onClosed(error.message ?: error.toString())
                    }
                })
                .exceptionally { error ->
                    val cause = error.cause ?: error
                    listener.onClosed(describe(cause))
                    null
                }
        } catch (e: Exception) {
            listener.onClosed(describe(e))
        }
    }

    override fun send(text: String): Boolean {
        val ws = socket ?: return false

        sender.execute {
            try {
                ws.sendText(text, true).join()
            } catch (e: Exception) {
                // The link is going down; the listener's onClosed/onError reports it.
            }
        }

        return true
    }

    override fun close() {
        val ws = socket
        socket = null

        try {
            ws?.sendClose(WebSocket.NORMAL_CLOSURE, "bye")
            ws?.abort()
        } catch (e: Exception) {
            // already closed
        }

        sender.shutdown()
    }

    private fun describe(error: Throwable): String {
        val message = error.message ?: error.toString()

        return if (message.contains("401")) {
            "The backend rejected the key (401). Check the Manager key."
        } else {
            message
        }
    }
}
