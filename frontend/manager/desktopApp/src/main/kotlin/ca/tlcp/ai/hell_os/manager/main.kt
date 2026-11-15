package ca.tlcp.ai.hell_os.manager

import androidx.compose.ui.window.Window
import androidx.compose.ui.window.application

fun main() = application {
    Window(
        onCloseRequest = ::exitApplication,
        title = "manager",
    ) {
        App()
    }
}