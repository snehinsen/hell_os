package ca.tlcp.ai.hell_os.manager

import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.material3.darkColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import ca.tlcp.ai.hell_os.manager.ui.ConnectScreen
import ca.tlcp.ai.hell_os.manager.ui.Dashboard
import kotlinx.coroutines.delay

private val HellColors = darkColorScheme(
    primary = Color(0xFF0078D7),
    onPrimary = Color.White,
    background = Color(0xFF0E0E0E),
    onBackground = Color(0xFFEDEDED),
    surface = Color(0xFF171717),
    onSurface = Color(0xFFEDEDED),
    surfaceVariant = Color(0xFF222222),
    onSurfaceVariant = Color(0xFFA8A8A8),
    outline = Color(0xFF444444),
    error = Color(0xFFF1707B),
)

/**
 * The HELL Manager. On desktop the platform supplies the WebSocket transport; on other
 * platforms (no way to send an Authorization header) it just explains itself.
 */
@Composable
fun App(platform: ManagerPlatform? = null) {
    MaterialTheme(colorScheme = HellColors) {
        Surface(modifier = Modifier.fillMaxSize(), color = MaterialTheme.colorScheme.background) {
            if (platform == null) {
                Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                    Text("The HELL Manager runs on desktop.")
                }
            } else {
                ManagerRoot(platform)
            }
        }
    }
}

@Composable
private fun ManagerRoot(platform: ManagerPlatform) {
    val scope = rememberCoroutineScope()
    val controller = remember(platform) { ManagerController(platform, scope) }

    LaunchedEffect(controller) {
        while (true) {
            delay(1_000)
            controller.tick()
        }
    }

    if (controller.active) {
        Dashboard(controller, platform)
    } else {
        ConnectScreen(controller)
    }
}
