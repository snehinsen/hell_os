# HELL OS backend

Spring Boot (Kotlin) WebSocket relay between the **Manager** (KMP, on the host) and the
**Target** (Electron, inside the VM). It also owns the SQLite database for API keys and the
event log.

```
Manager  <--wss-->  Backend  <--wss-->  Target (in the VM)
 (human)          (this app)           (accepts ONLY commands)
```

## Run it

```bash
./gradlew bootRun
```

On the **first** start it creates one Manager key and one Target key and prints each secret
**once** in the console. Copy them: only a hash is stored, so they can never be shown again.
After that, use the Manager's *Keys* tab to create or revoke keys.

| Setting | How | Default |
|---|---|---|
| Port | `PORT` | `8080` |
| Database file | `HELL_DB_PATH` | `hell.db` (next to where you run it) |
| Heartbeat timeout | `hell.heartbeat-timeout-ms` | `15000` |

## Endpoints

| Path | Who | Auth |
|---|---|---|
| `/ws/target` | the Target | `Authorization: Bearer <target key>` |
| `/ws/manager` | the Manager | `Authorization: Bearer <manager key>` |

Everything else is denied. Keys are 256 random bits, stored only as SHA-256 hashes. After
10 bad attempts in a minute an IP is blocked for a minute.

**This server is reachable over the internet: always put it behind TLS** (a reverse proxy such
as Caddy or nginx that terminates `wss://`). Set `server.forward-headers-strategy: native` in
`application.yaml` when you do, so the rate limiter sees real client IPs. The Target refuses to
send its key over plain `ws://` unless the host is `localhost`.

## Trust model (read this)

* **The Target is hostile.** Scammers have a session inside its VM and can read its key. So the
  Target key can only: say hello, heartbeat, report events, and answer commands. It cannot send
  commands, read logs, or touch keys. Everything it sends is size-limited, rate-limited and
  sanitised.
* **Only a Manager key can command.** Revoking a key instantly closes its connections.
* **Kill switch lives on the host, not here.** This backend only *reports* that the Target went
  silent (`state` with `online=false` after the heartbeat timeout). The Manager, which runs on
  the host, is what must cut the VM's network, power it off and restore the snapshot.

## Protocol

Defined once in [`protocol/src`](../protocol/src) and compiled into both this backend and the
Manager. The Target speaks the same JSON by hand. The command catalogue
(`command/CommandCatalogue.kt`) is the single list of what the Manager may do; add a command
there, then add its handler in `frontend/target/electron/commands.ts`.
