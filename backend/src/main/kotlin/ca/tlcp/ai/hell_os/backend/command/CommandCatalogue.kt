package ca.tlcp.ai.hell_os.backend.command

import ca.tlcp.ai.hell_os.protocol.ArgDef
import ca.tlcp.ai.hell_os.protocol.ArgKind
import ca.tlcp.ai.hell_os.protocol.CommandDef

/**
 * The command catalogue: the ONE list of things the Manager may make the Target do.
 *
 * - The Manager builds its buttons and forms from this list (no Manager change needed
 *   to add a command's UI).
 * - A future AI agent will get its tool definitions from the same list.
 * - The backend validates every command against it BEFORE forwarding, and the Target
 *   validates again on its side.
 *
 * To add a command: add it here, then add a handler in frontend/target/electron/commands.ts.
 */
object CommandCatalogue {

    private val CONTENT_APPS = listOf("settings", "defender")
    private val ALL_APPS = listOf("settings", "defender", "update")

    private const val MAX_TEXT = 200
    private const val MAX_LONG_TEXT = 1000

    val commands: List<CommandDef> = listOf(
        CommandDef(
            name = "ping",
            label = "Ping",
            description = "Check that the Target is alive and listening.",
            category = "Diagnostics",
        ),
        CommandDef(
            name = "open_window",
            label = "Open window",
            description = "Open (or bring to front) the Settings or Windows Security window.",
            category = "Windows",
            args = listOf(ArgDef("app", "Window", ArgKind.CHOICE, CONTENT_APPS)),
        ),
        CommandDef(
            name = "close_window",
            label = "Close window",
            description = "Close one of the Target's windows.",
            category = "Windows",
            args = listOf(ArgDef("app", "Window", ArgKind.CHOICE, ALL_APPS)),
        ),
        CommandDef(
            name = "show_update_screen",
            label = "Show fake update screen",
            description = "Fullscreen \"Working on updates\" screen. Its progress never finishes.",
            category = "Painful",
        ),
        CommandDef(
            name = "hide_update_screen",
            label = "Hide fake update screen",
            description = "Close the fake update screen.",
            category = "Painful",
        ),
        CommandDef(
            name = "show_message",
            label = "Show message box",
            description = "Pop a Windows-style message box in Settings or Windows Security.",
            category = "Messages",
            args = listOf(
                ArgDef("app", "Window", ArgKind.CHOICE, CONTENT_APPS),
                ArgDef("headline", "Headline", ArgKind.TEXT),
                ArgDef("detail", "Details (one line per row)", ArgKind.LONG_TEXT, required = false),
            ),
        ),
        CommandDef(
            name = "show_toast",
            label = "Show notification",
            description = "Pop a notification in the corner of Settings or Windows Security.",
            category = "Messages",
            args = listOf(
                ArgDef("app", "Window", ArgKind.CHOICE, CONTENT_APPS, defaultValue = "defender"),
                ArgDef("title", "Title", ArgKind.TEXT),
                ArgDef("body", "Body (one line per row)", ArgKind.LONG_TEXT, required = false),
            ),
        ),
    )

    private val byName = commands.associateBy { it.name }

    /** Returns a human-readable problem, or null when the command and arguments are valid. */
    fun validate(name: String, args: Map<String, String>): String? {
        val def = byName[name] ?: return "Unknown command: $name"

        val known = def.args.map { it.name }.toSet()
        args.keys.firstOrNull { it !in known }?.let { return "Unexpected argument: $it" }

        for (arg in def.args) {
            val value = args[arg.name]?.trim().orEmpty()

            if (value.isEmpty()) {
                if (arg.required) return "Missing: ${arg.label}"
                continue
            }

            val max = if (arg.kind == ArgKind.LONG_TEXT) MAX_LONG_TEXT else MAX_TEXT
            if (value.length > max) return "${arg.label} is too long (max $max characters)"

            if (arg.kind == ArgKind.CHOICE && value !in arg.options) {
                return "${arg.label} must be one of: ${arg.options.joinToString(", ")}"
            }
        }

        return null
    }
}
