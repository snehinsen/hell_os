package ca.tlcp.ai.hell_os.backend.ws

import ca.tlcp.ai.hell_os.backend.command.CommandCatalogue
import ca.tlcp.ai.hell_os.backend.persistence.KeyRole
import ca.tlcp.ai.hell_os.backend.security.ApiKeyService
import ca.tlcp.ai.hell_os.backend.security.toInfo
import ca.tlcp.ai.hell_os.backend.service.EventLogService
import ca.tlcp.ai.hell_os.protocol.AckMsg
import ca.tlcp.ai.hell_os.protocol.CatalogueMsg
import ca.tlcp.ai.hell_os.protocol.CreateKey
import ca.tlcp.ai.hell_os.protocol.ErrorMsg
import ca.tlcp.ai.hell_os.protocol.GetLogs
import ca.tlcp.ai.hell_os.protocol.GetState
import ca.tlcp.ai.hell_os.protocol.KeyCreatedMsg
import ca.tlcp.ai.hell_os.protocol.KeysMsg
import ca.tlcp.ai.hell_os.protocol.ListKeys
import ca.tlcp.ai.hell_os.protocol.LogsMsg
import ca.tlcp.ai.hell_os.protocol.RevokeKey
import ca.tlcp.ai.hell_os.protocol.SendCommand
import ca.tlcp.ai.hell_os.protocol.ServerToManager
import ca.tlcp.ai.hell_os.protocol.StateMsg
import ca.tlcp.ai.hell_os.protocol.TargetCommand
import ca.tlcp.ai.hell_os.protocol.decodeManagerMessage
import kotlinx.serialization.SerializationException
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Component
import org.springframework.web.socket.CloseStatus
import org.springframework.web.socket.TextMessage
import org.springframework.web.socket.WebSocketSession
import org.springframework.web.socket.handler.TextWebSocketHandler

/**
 * The Manager's connection (/ws/manager): the human in the loop. Only this side may send
 * commands, read the log, or manage API keys.
 */
@Component
class ManagerHandler(
    private val registry: SessionRegistry,
    private val keys: ApiKeyService,
    private val events: EventLogService,
) : TextWebSocketHandler() {

    private val log = LoggerFactory.getLogger(ManagerHandler::class.java)

    override fun afterConnectionEstablished(session: WebSocketSession) {
        val principal = session.keyPrincipal()

        if (principal == null) {
            session.close(CloseStatus.POLICY_VIOLATION)
            return
        }

        val decorated = registry.addManager(session, principal.keyId)
        log.info("Manager connected (key '{}')", principal.name)
        events.record("BACKEND", "manager_connected", "Manager connected", "key: ${principal.name}")

        registry.sendToManager(decorated, CatalogueMsg(CommandCatalogue.commands))
        registry.sendToManager(decorated, StateMsg(registry.status()))
    }

    override fun handleTextMessage(session: WebSocketSession, message: TextMessage) {
        val reply = registry.sessionFor(session.id) ?: return

        val msg = try {
            decodeManagerMessage(message.payload)
        } catch (_: SerializationException) {
            registry.sendToManager(reply, ErrorMsg("Could not understand that message."))
            return
        } catch (_: IllegalArgumentException) {
            registry.sendToManager(reply, ErrorMsg("Could not understand that message."))
            return
        }

        try {
            when (msg) {
                is SendCommand -> sendCommand(reply, msg)

                is GetState -> registry.sendToManager(reply, StateMsg(registry.status()))

                is GetLogs -> {
                    val limit = msg.limit.coerceIn(1, 200)
                    val rows = events.query(limit + 1, msg.beforeId)
                    registry.sendToManager(reply, LogsMsg(rows.take(limit), rows.size > limit))
                }

                is ListKeys -> registry.sendToManager(reply, KeysMsg(keyInfos()))

                is CreateKey -> createKey(reply, session, msg)

                is RevokeKey -> revokeKey(reply, session, msg)
            }
        } catch (e: Exception) {
            log.warn("Manager request failed", e)
            registry.sendToManager(reply, ErrorMsg("The backend could not complete that request."))
        }
    }

    override fun afterConnectionClosed(session: WebSocketSession, status: CloseStatus) {
        registry.removeManager(session.id)
        events.record("BACKEND", "manager_disconnected", "Manager disconnected", status.toString())
    }

    override fun handleTransportError(session: WebSocketSession, exception: Throwable) {
        log.debug("Manager transport error: {}", exception.message)
    }

    /* ---------------- Commands ---------------- */

    private fun sendCommand(reply: WebSocketSession, msg: SendCommand) {
        fun reject(reason: String) {
            events.record("MANAGER", "command_rejected", "${msg.command}: $reason")
            registry.sendToManager(reply, AckMsg(msg.id, accepted = false, reason = reason))
        }

        if (msg.id.isBlank() || msg.id.length > 64) return reject("Invalid command id")

        CommandCatalogue.validate(msg.command, msg.args)?.let { return reject(it) }

        if (!registry.sendToTarget(TargetCommand(msg.id, msg.command, msg.args))) {
            return reject("The Target is offline")
        }

        events.record(
            source = "MANAGER",
            kind = "command_sent",
            summary = "Sent ${msg.command}",
            detail = msg.args.entries.joinToString(", ") { "${it.key}=${it.value}" }.ifEmpty { null },
        )

        registry.sendToManager(reply, AckMsg(msg.id, accepted = true))
    }

    /* ---------------- Keys ---------------- */

    private fun keyInfos() = keys.list().map { it.toInfo() }

    private fun createKey(reply: WebSocketSession, session: WebSocketSession, msg: CreateKey) {
        val role = KeyRole.entries.firstOrNull { it.name == msg.role }

        if (role == null || msg.name.isBlank()) {
            registry.sendToManager(reply, ErrorMsg("A key needs a name and a role (TARGET or MANAGER)."))
            return
        }

        val created = keys.create(msg.name, role)
        val by = session.keyPrincipal()?.name ?: "?"

        // The secret itself is never logged.
        events.record("MANAGER", "key_created", "Created ${role.name} key '${created.key.name}'", "by key: $by")

        registry.sendToManager(reply, KeyCreatedMsg(created.key.toInfo(), created.secret))
        registry.broadcast(KeysMsg(keyInfos()))
    }

    private fun revokeKey(reply: WebSocketSession, session: WebSocketSession, msg: RevokeKey) {
        val target = keys.list().firstOrNull { it.id == msg.id }

        if (target == null) {
            registry.sendToManager(reply, ErrorMsg("No such key."))
            return
        }

        // Never lock the owner out: always keep at least one active Manager key.
        if (target.role == KeyRole.MANAGER && target.revokedAtMs == null && keys.activeCount(KeyRole.MANAGER) <= 1) {
            registry.sendToManager(reply, ErrorMsg("You cannot revoke the last active Manager key."))
            return
        }

        keys.revoke(msg.id)
        registry.closeByKey(msg.id)

        val by = session.keyPrincipal()?.name ?: "?"
        events.record("MANAGER", "key_revoked", "Revoked ${target.role.name} key '${target.name}'", "by key: $by")

        registry.broadcast(KeysMsg(keyInfos()))
    }

    private fun WebSocketSession.sendTo(message: ServerToManager) = registry.sendToManager(this, message)
}
