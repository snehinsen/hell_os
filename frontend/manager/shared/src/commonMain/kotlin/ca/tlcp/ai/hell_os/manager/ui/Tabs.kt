package ca.tlcp.ai.hell_os.manager.ui

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.text.selection.SelectionContainer
import androidx.compose.material3.Button
import androidx.compose.material3.Card
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateMapOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import ca.tlcp.ai.hell_os.manager.LinkStatus
import ca.tlcp.ai.hell_os.manager.ManagerController
import ca.tlcp.ai.hell_os.manager.Tone
import ca.tlcp.ai.hell_os.protocol.ArgDef
import ca.tlcp.ai.hell_os.protocol.ArgKind
import ca.tlcp.ai.hell_os.protocol.CommandDef

/* ------------------------------------------------------------------ */
/* Control: one card per command in the backend's catalogue            */
/* ------------------------------------------------------------------ */

@Composable
fun CommandsTab(controller: ManagerController) {
    val groups = controller.catalogue.groupBy { it.category }
    val canSend = controller.status == LinkStatus.CONNECTED && controller.target.online

    Column(Modifier.fillMaxSize()) {
        if (!controller.target.online) {
            Text(
                "The Target is offline: commands will be rejected.",
                color = toneColor(Tone.WARN),
                modifier = Modifier.padding(start = 20.dp, top = 12.dp),
            )
        }

        if (groups.isEmpty()) {
            Text(
                "Waiting for the command catalogue from the backend...",
                color = MaterialTheme.colorScheme.onSurfaceVariant,
                modifier = Modifier.padding(20.dp),
            )
        }

        LazyColumn(
            modifier = Modifier.fillMaxSize(),
            contentPadding = PaddingValues(20.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp),
        ) {
            groups.forEach { (category, defs) ->
                item(key = "header-$category") {
                    Text(
                        category.uppercase(),
                        style = MaterialTheme.typography.labelLarge,
                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                        modifier = Modifier.padding(top = 8.dp),
                    )
                }

                items(defs, key = { it.name }) { def ->
                    CommandCard(
                        def = def,
                        status = controller.commandStatus[def.name],
                        canSend = canSend,
                        onSend = { args -> controller.sendCommand(def, args) },
                    )
                }
            }
        }
    }
}

@Composable
private fun CommandCard(
    def: CommandDef,
    status: String?,
    canSend: Boolean,
    onSend: (Map<String, String>) -> Unit,
) {
    val values = remember(def.name) { mutableStateMapOf<String, String>() }

    fun valueOf(arg: ArgDef): String = values[arg.name] ?: when {
        arg.defaultValue.isNotEmpty() -> arg.defaultValue
        arg.kind == ArgKind.CHOICE -> arg.options.firstOrNull().orEmpty()
        else -> ""
    }

    val complete = def.args.all { !it.required || valueOf(it).isNotBlank() }

    Card(Modifier.fillMaxWidth()) {
        Column(Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
            Text(def.label, style = MaterialTheme.typography.titleMedium)
            Text(
                def.description,
                style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
            )

            def.args.forEach { arg ->
                when (arg.kind) {
                    ArgKind.CHOICE -> ChoiceField(
                        label = arg.label,
                        options = arg.options,
                        value = valueOf(arg),
                        onChange = { values[arg.name] = it },
                        modifier = Modifier.fillMaxWidth(),
                    )

                    ArgKind.LONG_TEXT -> OutlinedTextField(
                        value = valueOf(arg),
                        onValueChange = { values[arg.name] = it },
                        label = { Text(arg.label) },
                        minLines = 3,
                        modifier = Modifier.fillMaxWidth(),
                    )

                    ArgKind.TEXT -> OutlinedTextField(
                        value = valueOf(arg),
                        onValueChange = { values[arg.name] = it },
                        label = { Text(arg.label) },
                        singleLine = true,
                        modifier = Modifier.fillMaxWidth(),
                    )
                }
            }

            Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(14.dp)) {
                Button(
                    onClick = { onSend(def.args.associate { it.name to valueOf(it) }) },
                    enabled = canSend && complete,
                ) {
                    Text("Send")
                }

                status?.let {
                    val tone = when {
                        it.startsWith("Done") -> Tone.GOOD
                        it.startsWith("Failed") || it.startsWith("Rejected") || it.startsWith("Not") -> Tone.BAD
                        else -> Tone.INFO
                    }

                    Text(it, color = toneColor(tone), style = MaterialTheme.typography.bodySmall)
                }
            }
        }
    }
}

/* ------------------------------------------------------------------ */
/* Live feed: everything the Target reports, as it happens             */
/* ------------------------------------------------------------------ */

@Composable
fun FeedTab(controller: ManagerController, format: (Long, Boolean) -> String) {
    Column(Modifier.fillMaxSize()) {
        Row(
            Modifier.fillMaxWidth().padding(horizontal = 20.dp, vertical = 10.dp),
            verticalAlignment = Alignment.CenterVertically,
        ) {
            Text(
                "What the Target is reporting (newest first)",
                color = MaterialTheme.colorScheme.onSurfaceVariant,
                modifier = Modifier.weight(1f),
            )
            OutlinedButton(onClick = { controller.clearFeed() }) { Text("Clear") }
        }

        HorizontalDivider()

        if (controller.feed.isEmpty()) {
            Text(
                "Nothing yet.",
                color = MaterialTheme.colorScheme.onSurfaceVariant,
                modifier = Modifier.padding(20.dp),
            )
        }

        LazyColumn(Modifier.fillMaxSize(), contentPadding = PaddingValues(horizontal = 20.dp, vertical = 8.dp)) {
            items(controller.feed, key = { it.id }) { item ->
                LogRow(format(item.at, false), item.source, item.text, item.detail, item.tone)
            }
        }
    }
}

@Composable
private fun LogRow(time: String, source: String, text: String, detail: String?, tone: Tone) {
    Row(
        Modifier.fillMaxWidth().padding(vertical = 6.dp),
        horizontalArrangement = Arrangement.spacedBy(12.dp),
    ) {
        Text(
            time,
            fontFamily = FontFamily.Monospace,
            style = MaterialTheme.typography.bodySmall,
            color = MaterialTheme.colorScheme.onSurfaceVariant,
            modifier = Modifier.width(150.dp),
        )
        Pill(source, tone)
        Column(Modifier.weight(1f)) {
            SelectionContainer { Text(text) }
            detail?.let {
                SelectionContainer {
                    Text(it, style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
                }
            }
        }
    }
}

/* ------------------------------------------------------------------ */
/* History: the persistent event log in the backend's database         */
/* ------------------------------------------------------------------ */

@Composable
fun HistoryTab(controller: ManagerController, format: (Long, Boolean) -> String) {
    LaunchedEffect(Unit) { controller.requestHistory(reset = true) }

    Column(Modifier.fillMaxSize()) {
        Row(
            Modifier.fillMaxWidth().padding(horizontal = 20.dp, vertical = 10.dp),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(10.dp),
        ) {
            Text(
                "Stored in the backend database",
                color = MaterialTheme.colorScheme.onSurfaceVariant,
                modifier = Modifier.weight(1f),
            )
            OutlinedButton(onClick = { controller.requestHistory(reset = true) }) { Text("Refresh") }
            if (controller.historyHasMore) {
                OutlinedButton(onClick = { controller.requestHistory(reset = false) }) { Text("Load older") }
            }
        }

        HorizontalDivider()

        LazyColumn(Modifier.fillMaxSize(), contentPadding = PaddingValues(horizontal = 20.dp, vertical = 8.dp)) {
            items(controller.history, key = { it.id }) { entry ->
                val tone = when (entry.source) {
                    "TARGET" -> Tone.WARN
                    "MANAGER" -> Tone.GOOD
                    else -> Tone.INFO
                }

                LogRow(format(entry.at, true), entry.source, "${entry.kind}: ${entry.summary}", entry.detail, tone)
            }
        }
    }
}

/* ------------------------------------------------------------------ */
/* Keys: create and revoke API keys                                    */
/* ------------------------------------------------------------------ */

@Composable
fun KeysTab(controller: ManagerController, format: (Long, Boolean) -> String) {
    LaunchedEffect(Unit) { controller.requestKeys() }

    var name by remember { mutableStateOf("") }
    var role by remember { mutableStateOf("TARGET") }

    LazyColumn(
        Modifier.fillMaxSize(),
        contentPadding = PaddingValues(20.dp),
        verticalArrangement = Arrangement.spacedBy(12.dp),
    ) {
        controller.newSecret?.let { created ->
            item(key = "secret") {
                Card(Modifier.fillMaxWidth()) {
                    Column(Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                        Text(
                            "New ${created.key.role} key '${created.key.name}': copy it NOW",
                            style = MaterialTheme.typography.titleMedium,
                            color = toneColor(Tone.WARN),
                        )
                        Text(
                            "This is the only time the secret is ever shown. The backend stores just a hash.",
                            style = MaterialTheme.typography.bodySmall,
                            color = MaterialTheme.colorScheme.onSurfaceVariant,
                        )
                        SelectionContainer {
                            Text(created.secret, fontFamily = FontFamily.Monospace)
                        }
                        OutlinedButton(onClick = { controller.dismissSecret() }) { Text("I have saved it") }
                    }
                }
            }
        }

        item(key = "create") {
            Card(Modifier.fillMaxWidth()) {
                Column(Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
                    Text("Create a key", style = MaterialTheme.typography.titleMedium)
                    OutlinedTextField(
                        value = name,
                        onValueChange = { name = it },
                        label = { Text("Name (e.g. \"VM #2 target\")") },
                        singleLine = true,
                        modifier = Modifier.fillMaxWidth(),
                    )
                    ChoiceField("Role", listOf("TARGET", "MANAGER"), role, { role = it }, Modifier.fillMaxWidth())
                    Button(
                        onClick = {
                            controller.createKey(name, role)
                            name = ""
                        },
                        enabled = name.isNotBlank(),
                    ) {
                        Text("Create")
                    }
                }
            }
        }

        item(key = "list-title") {
            Text(
                "Keys",
                style = MaterialTheme.typography.labelLarge,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
            )
        }

        items(controller.keys, key = { it.id }) { key ->
            Row(
                Modifier.fillMaxWidth(),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(12.dp),
            ) {
                Column(Modifier.weight(1f)) {
                    Text("#${key.id}  ${key.name}", fontWeight = FontWeight.SemiBold)
                    Text(
                        buildString {
                            append(key.role)
                            append(" · created ")
                            append(format(key.createdAt, true))
                            append(" · last used ")
                            append(key.lastUsedAt?.let { format(it, true) } ?: "never")
                        },
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                    )
                }

                if (key.revokedAt != null) {
                    Pill("Revoked", Tone.BAD)
                } else {
                    OutlinedButton(onClick = { controller.revokeKey(key.id) }) { Text("Revoke") }
                }
            }
            HorizontalDivider(Modifier.padding(top = 8.dp))
        }

        item(key = "end") { Spacer(Modifier.padding(8.dp)) }
    }
}
