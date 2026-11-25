package ca.tlcp.ai.hell_os.manager

/**
 * The Manager's UI and logic are shared (commonMain), but a few things are platform-specific:
 * the WebSocket transport (the browser can't send an Authorization header, so only the
 * desktop app implements this), time formatting and settings storage.
 */
interface Transport {
    interface Listener {
        fun onOpen()
        fun onText(text: String)
        fun onClosed(reason: String?)
    }

    /** Connects asynchronously. Failures are reported through [Listener.onClosed]. */
    fun connect(url: String, bearerKey: String, listener: Listener)

    fun send(text: String): Boolean

    fun close()
}

data class SavedSettings(val url: String, val key: String)

interface ManagerPlatform {
    fun createTransport(): Transport

    fun nowMs(): Long

    /** "14:03:22", or "2026-11-24 14:03:22" when [withDate] is true, in the local time zone. */
    fun formatTime(epochMs: Long, withDate: Boolean): String

    fun loadSettings(): SavedSettings?

    fun saveSettings(settings: SavedSettings)
}
