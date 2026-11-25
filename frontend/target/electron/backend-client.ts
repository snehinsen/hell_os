import { app } from 'electron'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import WebSocket from 'ws'
import { executeCommand, parseCommand } from './commands'
import { setReportSink, type Report } from './report'

/**
 * The Target's ONLY connection to the outside world: one outbound WebSocket to the backend.
 *
 *  - It opens no ports and watches no files.
 *  - It accepts exactly one kind of incoming message: a valid `command` (see commands.ts).
 *    Everything else is dropped without a reply.
 *  - It sends only: hello, heartbeats, reports (for human oversight) and command results.
 *  - It authenticates with a Target API key, which can do nothing else on the backend.
 *
 * Configuration (first match wins):
 *   env HELL_BACKEND_URL + HELL_TARGET_KEY
 *   hell.config.json next to the app (see hell.config.example.json)
 */

const PROTOCOL_VERSION = 1
const HEARTBEAT_MS = 5_000
const MAX_QUEUED_REPORTS = 100

interface Config {
    backendUrl: string
    targetKey: string
}

function readConfigFile(file: string): Partial<Config> | null {
    try {
        const parsed: unknown = JSON.parse(fs.readFileSync(file, 'utf8'))

        if (typeof parsed !== 'object' || parsed === null) return null

        const object = parsed as Record<string, unknown>

        return {
            backendUrl: typeof object.backendUrl === 'string' ? object.backendUrl : undefined,
            targetKey: typeof object.targetKey === 'string' ? object.targetKey : undefined,
        }
    } catch {
        return null
    }
}

function loadConfig(): Config | null {
    const fromEnv = {
        backendUrl: process.env.HELL_BACKEND_URL,
        targetKey: process.env.HELL_TARGET_KEY,
    }

    if (fromEnv.backendUrl && fromEnv.targetKey) {
        return { backendUrl: fromEnv.backendUrl, targetKey: fromEnv.targetKey }
    }

    const candidates = [
        path.join(app.getAppPath(), 'hell.config.json'),
        path.join(path.dirname(process.execPath), 'hell.config.json'),
        path.join(process.resourcesPath ?? '', 'hell.config.json'),
    ]

    for (const file of candidates) {
        const config = readConfigFile(file)

        if (config?.backendUrl && config.targetKey) {
            return { backendUrl: config.backendUrl, targetKey: config.targetKey }
        }
    }

    return null
}

/** The key is sent as a header, so refuse to send it in the clear to anything but this machine. */
function transportIsSafe(rawUrl: string): boolean {
    try {
        const url = new URL(rawUrl)

        if (url.protocol === 'wss:') return true
        if (url.protocol !== 'ws:') return false

        const local = ['localhost', '127.0.0.1', '::1', '[::1]'].includes(url.hostname)
        return local || process.env.HELL_ALLOW_INSECURE === '1'
    } catch {
        return false
    }
}

let socket: WebSocket | null = null
let heartbeat: ReturnType<typeof setInterval> | null = null
let reconnectTimer: ReturnType<typeof setTimeout> | null = null
let attempt = 0

// Reports made while the link is down wait here (bounded) and are sent once it is back.
const queue: Report[] = []

function send(message: unknown): boolean {
    if (!socket || socket.readyState !== WebSocket.OPEN) return false

    socket.send(JSON.stringify(message))
    return true
}

function sendReport(item: Report): boolean {
    return send({
        type: 'report',
        kind: item.kind,
        summary: item.summary,
        detail: item.detail,
        at: item.at,
    })
}

function deliver(item: Report): void {
    if (sendReport(item)) return

    queue.push(item)
    if (queue.length > MAX_QUEUED_REPORTS) queue.shift()
}

async function handleCommand(raw: string): Promise<void> {
    const command = parseCommand(raw)

    // Not a valid command: ignore it completely. The Target never answers anything else.
    if (!command) return

    const result = await executeCommand(command.command, command.args)

    send({
        type: 'result',
        id: command.id,
        ok: result.ok,
        message: result.message.slice(0, 500),
    })
}

function stopHeartbeat(): void {
    if (heartbeat) clearInterval(heartbeat)
    heartbeat = null
}

function scheduleReconnect(config: Config): void {
    if (reconnectTimer) return

    // 1s, 2s, 4s ... capped at 30s, with a little jitter.
    const delay = Math.min(30_000, 1_000 * 2 ** attempt) + Math.floor(Math.random() * 500)
    attempt++

    reconnectTimer = setTimeout(() => {
        reconnectTimer = null
        connect(config)
    }, delay)
}

function connect(config: Config): void {
    const link = new WebSocket(config.backendUrl, {
        headers: { Authorization: `Bearer ${config.targetKey}` },
        handshakeTimeout: 10_000,
        maxPayload: 64 * 1024,
    })

    socket = link

    link.on('open', () => {
        attempt = 0

        send({
            type: 'hello',
            version: PROTOCOL_VERSION,
            info: `${os.hostname()} (${os.platform()} ${os.release()})`,
        })

        stopHeartbeat()
        heartbeat = setInterval(() => send({ type: 'heartbeat' }), HEARTBEAT_MS)

        for (const item of queue.splice(0)) sendReport(item)
    })

    link.on('message', (data: WebSocket.RawData, isBinary: boolean) => {
        if (isBinary || !Buffer.isBuffer(data)) return

        void handleCommand(data.toString('utf8'))
    })

    link.on('close', () => {
        stopHeartbeat()

        if (socket === link) {
            socket = null
            scheduleReconnect(config)
        }
    })

    // 'close' always follows 'error', which is where the reconnect is scheduled.
    link.on('error', () => undefined)
}

export function startBackendClient(): void {
    setReportSink(deliver)

    const config = loadConfig()

    if (!config) {
        console.warn('[hell] No backend configured (HELL_BACKEND_URL / HELL_TARGET_KEY or hell.config.json). Idle.')
        return
    }

    if (!transportIsSafe(config.backendUrl)) {
        console.error('[hell] Refusing to connect: use wss:// (or ws:// to localhost).')
        return
    }

    connect(config)
}
