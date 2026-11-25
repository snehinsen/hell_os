package ca.tlcp.ai.hell_os.backend.ws

import ca.tlcp.ai.hell_os.backend.security.ApiKeyPrincipal
import ca.tlcp.ai.hell_os.protocol.ServerToManager
import ca.tlcp.ai.hell_os.protocol.ServerToTarget
import ca.tlcp.ai.hell_os.protocol.TargetStatus
import ca.tlcp.ai.hell_os.protocol.encode
import org.slf4j.LoggerFactory
import org.springframework.security.core.Authentication
import org.springframework.stereotype.Component
import org.springframework.web.socket.CloseStatus
import org.springframework.web.socket.TextMessage
import org.springframework.web.socket.WebSocketSession
import org.springframework.web.socket.handler.ConcurrentWebSocketSessionDecorator
import java.util.concurrent.ConcurrentHashMap

/** The API key a WebSocket session authenticated with. */
fun WebSocketSession.keyPrincipal(): ApiKeyPrincipal? =
    (principal as? Authentication)?.principal as? ApiKeyPrincipal

/**
 * Tracks the one Target and any number of Manager sessions.
 * WebSocket sessions are not safe to write to from several threads, so every
 * session is wrapped in a ConcurrentWebSocketSessionDecorator.
 */
@Component
class SessionRegistry {

    private val log = LoggerFactory.getLogger(SessionRegistry::class.java)

    private val sessions = ConcurrentHashMap<String, WebSocketSession>()
    private val managerIds: MutableSet<String> = ConcurrentHashMap.newKeySet()
    private val keyIds = ConcurrentHashMap<String, Long>()

    @Volatile
    private var targetId: String? = null

    @Volatile
    var targetInfo: String? = null

    @Volatile
    var lastSeenMs: Long? = null

    private fun decorate(session: WebSocketSession): WebSocketSession =
        ConcurrentWebSocketSessionDecorator(session, SEND_TIME_LIMIT_MS, SEND_BUFFER_LIMIT)

    /* ---------------- Managers ---------------- */

    fun addManager(session: WebSocketSession, keyId: Long): WebSocketSession {
        val decorated = decorate(session)
        sessions[session.id] = decorated
        managerIds += session.id
        keyIds[session.id] = keyId
        return decorated
    }

    fun removeManager(id: String) {
        managerIds -= id
        sessions -= id
        keyIds -= id
    }

    fun sessionFor(id: String): WebSocketSession? = sessions[id]

    fun sendToManager(session: WebSocketSession, message: ServerToManager) {
        send(session, message.encode())
    }

    fun broadcast(message: ServerToManager) {
        val text = message.encode()
        managerIds.mapNotNull { sessions[it] }.forEach { send(it, text) }
    }

    /* ---------------- Target ---------------- */

    /** Registers a new Target connection; a previous one is closed (only one Target at a time). */
    fun setTarget(session: WebSocketSession, keyId: Long): WebSocketSession {
        val previous = targetId
        val decorated = decorate(session)

        sessions[session.id] = decorated
        keyIds[session.id] = keyId
        targetId = session.id
        targetInfo = null
        lastSeenMs = System.currentTimeMillis()

        if (previous != null && previous != session.id) {
            closeQuietly(sessions.remove(previous), CloseStatus.POLICY_VIOLATION.withReason("Replaced by a new connection"))
            keyIds -= previous
        }

        return decorated
    }

    /** Returns true if this session was the current Target (false if it was already replaced or dropped). */
    fun clearTarget(id: String): Boolean {
        sessions -= id
        keyIds -= id

        if (targetId == id) {
            targetId = null
            return true
        }

        return false
    }

    fun touchTarget() {
        lastSeenMs = System.currentTimeMillis()
    }

    fun status(): TargetStatus =
        TargetStatus(online = targetId != null, lastSeen = lastSeenMs, info = targetInfo)

    /** Sends a command to the Target. False when there is no Target connected. */
    fun sendToTarget(message: ServerToTarget): Boolean {
        val session = targetId?.let { sessions[it] } ?: return false
        return send(session, message.encode())
    }

    fun hasTimedOut(timeoutMs: Long): Boolean {
        if (targetId == null) return false
        return System.currentTimeMillis() - (lastSeenMs ?: 0L) > timeoutMs
    }

    /** Forcibly drops the Target. True if there was one. */
    fun dropTarget(): Boolean {
        val id = targetId ?: return false
        targetId = null

        closeQuietly(sessions.remove(id), CloseStatus.SESSION_NOT_RELIABLE.withReason("Heartbeat timeout"))
        keyIds -= id
        return true
    }

    /* ---------------- Keys ---------------- */

    /** Closes every connection that authenticated with this key (used when it is revoked). */
    fun closeByKey(keyId: Long) {
        keyIds.filterValues { it == keyId }.keys.forEach { id ->
            closeQuietly(sessions[id], CloseStatus.POLICY_VIOLATION.withReason("Key revoked"))
        }
    }

    /* ---------------- Helpers ---------------- */

    private fun send(session: WebSocketSession, text: String): Boolean =
        try {
            if (session.isOpen) {
                session.sendMessage(TextMessage(text))
                true
            } else {
                false
            }
        } catch (e: Exception) {
            log.warn("Could not send to session {}: {}", session.id, e.message)
            false
        }

    private fun closeQuietly(session: WebSocketSession?, status: CloseStatus) {
        try {
            session?.close(status)
        } catch (e: Exception) {
            log.debug("Session was already closed: {}", e.message)
        }
    }

    private companion object {
        const val SEND_TIME_LIMIT_MS = 5_000
        const val SEND_BUFFER_LIMIT = 512 * 1024
    }
}
