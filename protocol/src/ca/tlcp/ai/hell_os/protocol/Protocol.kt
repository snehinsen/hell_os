package ca.tlcp.ai.hell_os.protocol

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable
import kotlinx.serialization.json.Json

/*
 * HELL OS wire protocol: the single source of truth.
 *
 * This ONE file is compiled into both the Spring Boot backend (backend/build.gradle.kts)
 * and the KMP Manager (frontend/manager/shared/build.gradle.kts), so the two can never
 * drift apart. The Electron Target speaks the same JSON by hand (frontend/target/electron).
 *
 * Every frame is a JSON text message with a "type" field:
 *
 *   Manager -> Backend   ManagerToServer   (commands, queries, key management)
 *   Backend -> Manager   ServerToManager   (catalogue, state, acks, results, reports, logs)
 *   Target  -> Backend   TargetToServer    (hello, heartbeat, reports, results)
 *   Backend -> Target    ServerToTarget    (commands ONLY)
 */

const val PROTOCOL_VERSION = 1

val ProtocolJson: Json = Json {
    ignoreUnknownKeys = true
    encodeDefaults = true
}

/* ------------------------------------------------------------------ */
/* Shared data                                                         */
/* ------------------------------------------------------------------ */

@Serializable
enum class ArgKind { TEXT, LONG_TEXT, CHOICE }

@Serializable
data class ArgDef(
    val name: String,
    val label: String,
    val kind: ArgKind = ArgKind.TEXT,
    val options: List<String> = emptyList(),
    val required: Boolean = true,
    val defaultValue: String = "",
)

/** One command the Target understands. The Manager builds its UI from these. */
@Serializable
data class CommandDef(
    val name: String,
    val label: String,
    val description: String,
    val category: String,
    val args: List<ArgDef> = emptyList(),
)

@Serializable
data class TargetStatus(
    val online: Boolean,
    val lastSeen: Long? = null,
    val info: String? = null,
)

@Serializable
data class LogEntry(
    val id: Long,
    val at: Long,
    val source: String,
    val kind: String,
    val summary: String,
    val detail: String? = null,
)

@Serializable
data class KeyInfo(
    val id: Long,
    val name: String,
    val role: String,
    val createdAt: Long,
    val lastUsedAt: Long? = null,
    val revokedAt: Long? = null,
)

/* ------------------------------------------------------------------ */
/* Manager -> Backend                                                  */
/* ------------------------------------------------------------------ */

@Serializable
sealed interface ManagerToServer

@Serializable
@SerialName("command")
data class SendCommand(
    val id: String,
    val command: String,
    val args: Map<String, String> = emptyMap(),
) : ManagerToServer

@Serializable
@SerialName("get_state")
data object GetState : ManagerToServer

@Serializable
@SerialName("get_logs")
data class GetLogs(
    val limit: Int = 100,
    val beforeId: Long? = null,
) : ManagerToServer

@Serializable
@SerialName("list_keys")
data object ListKeys : ManagerToServer

@Serializable
@SerialName("create_key")
data class CreateKey(
    val name: String,
    val role: String,
) : ManagerToServer

@Serializable
@SerialName("revoke_key")
data class RevokeKey(val id: Long) : ManagerToServer

/* ------------------------------------------------------------------ */
/* Backend -> Manager                                                  */
/* ------------------------------------------------------------------ */

@Serializable
sealed interface ServerToManager

@Serializable
@SerialName("catalogue")
data class CatalogueMsg(val commands: List<CommandDef>) : ServerToManager

@Serializable
@SerialName("state")
data class StateMsg(val status: TargetStatus) : ServerToManager

/** The backend accepted (and forwarded) or rejected a command. */
@Serializable
@SerialName("ack")
data class AckMsg(
    val id: String,
    val accepted: Boolean,
    val reason: String? = null,
) : ServerToManager

/** The Target's answer to a command. */
@Serializable
@SerialName("result")
data class ResultMsg(
    val id: String,
    val ok: Boolean,
    val message: String,
) : ServerToManager

/** A live event reported by the Target, for human oversight. */
@Serializable
@SerialName("report")
data class ReportMsg(
    val at: Long,
    val kind: String,
    val summary: String,
    val detail: String? = null,
) : ServerToManager

@Serializable
@SerialName("logs")
data class LogsMsg(
    val entries: List<LogEntry>,
    val hasMore: Boolean,
) : ServerToManager

@Serializable
@SerialName("keys")
data class KeysMsg(val keys: List<KeyInfo>) : ServerToManager

/** Sent once, only to the requester. The secret is never stored or shown again. */
@Serializable
@SerialName("key_created")
data class KeyCreatedMsg(
    val key: KeyInfo,
    val secret: String,
) : ServerToManager

@Serializable
@SerialName("error")
data class ErrorMsg(val message: String) : ServerToManager

/* ------------------------------------------------------------------ */
/* Target -> Backend                                                   */
/* ------------------------------------------------------------------ */

@Serializable
sealed interface TargetToServer

@Serializable
@SerialName("hello")
data class Hello(
    val version: Int,
    val info: String,
) : TargetToServer

@Serializable
@SerialName("heartbeat")
data object Heartbeat : TargetToServer

@Serializable
@SerialName("report")
data class TargetReport(
    val kind: String,
    val summary: String,
    val detail: String? = null,
    /** Epoch millis when it happened on the Target; the backend clamps it. */
    val at: Long? = null,
) : TargetToServer

@Serializable
@SerialName("result")
data class TargetResult(
    val id: String,
    val ok: Boolean,
    val message: String,
) : TargetToServer

/* ------------------------------------------------------------------ */
/* Backend -> Target (the ONLY thing a Target will ever accept)        */
/* ------------------------------------------------------------------ */

@Serializable
sealed interface ServerToTarget

@Serializable
@SerialName("command")
data class TargetCommand(
    val id: String,
    val command: String,
    val args: Map<String, String> = emptyMap(),
) : ServerToTarget

/* ------------------------------------------------------------------ */
/* Encode / decode helpers                                             */
/* ------------------------------------------------------------------ */

fun ManagerToServer.encode(): String =
    ProtocolJson.encodeToString(ManagerToServer.serializer(), this)

fun ServerToManager.encode(): String =
    ProtocolJson.encodeToString(ServerToManager.serializer(), this)

fun TargetToServer.encode(): String =
    ProtocolJson.encodeToString(TargetToServer.serializer(), this)

fun ServerToTarget.encode(): String =
    ProtocolJson.encodeToString(ServerToTarget.serializer(), this)

fun decodeManagerMessage(text: String): ManagerToServer =
    ProtocolJson.decodeFromString(ManagerToServer.serializer(), text)

fun decodeServerToManager(text: String): ServerToManager =
    ProtocolJson.decodeFromString(ServerToManager.serializer(), text)

fun decodeTargetMessage(text: String): TargetToServer =
    ProtocolJson.decodeFromString(TargetToServer.serializer(), text)
