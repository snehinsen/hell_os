package ca.tlcp.ai.hell_os.backend.ws

import ca.tlcp.ai.hell_os.backend.service.EventLogService
import ca.tlcp.ai.hell_os.protocol.Heartbeat
import ca.tlcp.ai.hell_os.protocol.Hello
import ca.tlcp.ai.hell_os.protocol.ReportMsg
import ca.tlcp.ai.hell_os.protocol.ResultMsg
import ca.tlcp.ai.hell_os.protocol.StateMsg
import ca.tlcp.ai.hell_os.protocol.TargetReport
import ca.tlcp.ai.hell_os.protocol.TargetResult
import ca.tlcp.ai.hell_os.protocol.TargetToServer
import ca.tlcp.ai.hell_os.protocol.decodeTargetMessage
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Component
import org.springframework.web.socket.CloseStatus
import org.springframework.web.socket.TextMessage
import org.springframework.web.socket.WebSocketSession
import org.springframework.web.socket.handler.TextWebSocketHandler
import java.util.concurrent.ConcurrentHashMap

/**
 * The Target's connection (/ws/target).
 *
 * The Target is treated as HOSTILE: scammers have a session inside its VM and could
 * read its key. So it can only say hello, send heartbeats, report events and answer
 * commands. It cannot issue commands, query logs or touch keys, and everything it
 * sends is size-limited, rate-limited and sanitised before it is stored or shown.
 */
@Component
class TargetHandler(
    private val registry: SessionRegistry,
    private val events: EventLogService,
) : TextWebSocketHandler() {

    private val log = LoggerFactory.getLogger(TargetHandler::class.java)

    // sessionId -> [windowStartMs, messagesInWindow]
    private val rate = ConcurrentHashMap<String, LongArray>()

    override fun afterConnectionEstablished(session: WebSocketSession) {
        val principal = session.keyPrincipal()

        if (principal == null) {
            session.close(CloseStatus.POLICY_VIOLATION)
            return
        }

        registry.setTarget(session, principal.keyId)
        log.info("Target connected (key '{}')", principal.name)

        events.record("BACKEND", "target_connected", "Target connected", "key: ${principal.name}")
        registry.broadcast(StateMsg(registry.status()))
    }

    override fun handleTextMessage(session: WebSocketSession, message: TextMessage) {
        if (tooFast(session.id)) {
            session.close(CloseStatus.POLICY_VIOLATION.withReason("Too many messages"))
            return
        }

        val msg = decode(message.payload)

        if (msg == null) {
            events.record("TARGET", "bad_message", "Target sent an undecodable message")
            return
        }

        registry.touchTarget()

        when (msg) {
            is Hello -> {
                registry.targetInfo = msg.info.take(200)
                events.record("TARGET", "hello", "Target says hello", "protocol v${msg.version}, ${msg.info.take(200)}")
                registry.broadcast(StateMsg(registry.status()))
            }

            is Heartbeat -> Unit

            is TargetReport -> {
                val entry = events.record(
                    source = "TARGET",
                    kind = sanitizeKind(msg.kind),
                    summary = msg.summary,
                    detail = msg.detail,
                    atMs = clampTime(msg.at),
                )

                registry.broadcast(ReportMsg(entry.at, entry.kind, entry.summary, entry.detail))
            }

            is TargetResult -> {
                val text = msg.message.take(500)

                events.record(
                    source = "TARGET",
                    kind = "result",
                    summary = (if (msg.ok) "OK: " else "FAILED: ") + text,
                    detail = "command id ${msg.id.take(64)}",
                )

                registry.broadcast(ResultMsg(msg.id.take(64), msg.ok, text))
            }
        }
    }

    override fun afterConnectionClosed(session: WebSocketSession, status: CloseStatus) {
        rate.remove(session.id)

        // False when this connection had already been replaced or dropped for a timeout.
        if (registry.clearTarget(session.id)) {
            log.info("Target disconnected ({})", status)
            events.record("BACKEND", "target_disconnected", "Target disconnected", status.toString())
            registry.broadcast(StateMsg(registry.status()))
        }
    }

    override fun handleTransportError(session: WebSocketSession, exception: Throwable) {
        log.debug("Target transport error: {}", exception.message)
    }

    private fun decode(payload: String): TargetToServer? =
        try {
            decodeTargetMessage(payload)
        } catch (e: Exception) {
            // Anything undecodable (bad JSON, unknown type, missing field) is simply dropped.
            log.debug("Undecodable target message: {}", e.message)
            null
        }

    /** More than 50 messages in one second means something is wrong. */
    private fun tooFast(id: String): Boolean {
        val now = System.currentTimeMillis()
        val counter = rate.computeIfAbsent(id) { longArrayOf(now, 0L) }

        synchronized(counter) {
            if (now - counter[0] >= 1_000) {
                counter[0] = now
                counter[1] = 0
            }

            counter[1]++
            return counter[1] > 50
        }
    }

    private fun sanitizeKind(kind: String): String =
        kind.lowercase().replace(Regex("[^a-z0-9_.:-]"), "").take(40).ifEmpty { "event" }

    /** The Target's clock is not trusted: anything outside the last 10 minutes becomes "now". */
    private fun clampTime(at: Long?): Long {
        val now = System.currentTimeMillis()
        return if (at != null && at in (now - 600_000)..now) at else now
    }
}
