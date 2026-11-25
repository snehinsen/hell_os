package ca.tlcp.ai.hell_os.manager.ui

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.width
import androidx.compose.material3.Button
import androidx.compose.material3.Card
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.unit.dp
import ca.tlcp.ai.hell_os.manager.LinkStatus
import ca.tlcp.ai.hell_os.manager.ManagerController
import ca.tlcp.ai.hell_os.manager.ManagerPlatform
import ca.tlcp.ai.hell_os.manager.Tone

@Composable
fun ConnectScreen(controller: ManagerController) {
    val saved = remember { controller.saved }
    var url by remember { mutableStateOf(saved?.url ?: "ws://localhost:8080/ws/manager") }
    var key by remember { mutableStateOf(saved?.key ?: "") }

    Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
        Card(modifier = Modifier.width(480.dp)) {
            Column(
                modifier = Modifier.padding(28.dp),
                verticalArrangement = Arrangement.spacedBy(14.dp),
            ) {
                Text("HELL Manager", style = MaterialTheme.typography.headlineMedium)
                Text(
                    "Connect to the backend with your Manager key.",
                    style = MaterialTheme.typography.bodyMedium,
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                )

                OutlinedTextField(
                    value = url,
                    onValueChange = { url = it },
                    label = { Text("Backend URL (use wss:// over the internet)") },
                    singleLine = true,
                    modifier = Modifier.fillMaxWidth(),
                )

                OutlinedTextField(
                    value = key,
                    onValueChange = { key = it },
                    label = { Text("Manager key") },
                    singleLine = true,
                    visualTransformation = PasswordVisualTransformation(),
                    modifier = Modifier.fillMaxWidth(),
                )

                controller.lastError?.let {
                    Text(it, color = MaterialTheme.colorScheme.error)
                }

                Button(
                    onClick = { controller.connect(url, key) },
                    enabled = url.isNotBlank() && key.isNotBlank(),
                    modifier = Modifier.fillMaxWidth(),
                ) {
                    Text("Connect")
                }
            }
        }
    }
}

private enum class DashTab(val label: String) {
    CONTROL("Control"),
    FEED("Live feed"),
    HISTORY("History"),
    KEYS("Keys"),
}

@Composable
fun Dashboard(controller: ManagerController, platform: ManagerPlatform) {
    var tab by remember { mutableStateOf(DashTab.CONTROL) }
    val format: (Long, Boolean) -> String = platform::formatTime

    Column(Modifier.fillMaxSize()) {
        // Header
        Row(
            modifier = Modifier.fillMaxWidth().padding(horizontal = 20.dp, vertical = 14.dp),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(12.dp),
        ) {
            Text("HELL Manager", style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.SemiBold)

            when (controller.status) {
                LinkStatus.CONNECTED -> Pill("Backend connected", Tone.GOOD)
                LinkStatus.CONNECTING -> Pill("Connecting...", Tone.WARN)
                LinkStatus.DISCONNECTED -> Pill("Backend lost, reconnecting", Tone.BAD)
            }

            val status = controller.target

            if (status.online) {
                val ageSeconds = status.lastSeen?.let { ((controller.nowMs - it) / 1000).coerceAtLeast(0) }
                Pill("Target online" + (ageSeconds?.let { " (seen ${it}s ago)" } ?: ""), Tone.GOOD)
            } else {
                Pill("Target offline", Tone.BAD)
            }

            status.info?.let {
                Text(it, style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
            }

            Spacer(Modifier.weight(1f))

            OutlinedButton(onClick = { controller.disconnect() }) { Text("Disconnect") }
        }

        // Tabs
        Row(Modifier.padding(horizontal = 12.dp)) {
            DashTab.entries.forEach { entry ->
                TextButton(onClick = { tab = entry }) {
                    Text(
                        entry.label,
                        fontWeight = if (entry == tab) FontWeight.Bold else FontWeight.Normal,
                        color = if (entry == tab) {
                            MaterialTheme.colorScheme.primary
                        } else {
                            MaterialTheme.colorScheme.onSurfaceVariant
                        },
                    )
                }
            }
        }

        HorizontalDivider()

        Box(Modifier.fillMaxSize()) {
            when (tab) {
                DashTab.CONTROL -> CommandsTab(controller)
                DashTab.FEED -> FeedTab(controller, format)
                DashTab.HISTORY -> HistoryTab(controller, format)
                DashTab.KEYS -> KeysTab(controller, format)
            }
        }
    }
}
