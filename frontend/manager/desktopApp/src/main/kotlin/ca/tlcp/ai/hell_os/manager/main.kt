package ca.tlcp.ai.hell_os.manager

import androidx.compose.ui.unit.dp
import androidx.compose.ui.window.Window
import androidx.compose.ui.window.application
import androidx.compose.ui.window.rememberWindowState

fun main() = application {
    val platform = DesktopPlatform()

    Window(
        onCloseRequest = ::exitApplication,
        title = "HELL Manager",
        state = rememberWindowState(width = 1180.dp, height = 780.dp),
    ) {
        App(platform)
    }
}
