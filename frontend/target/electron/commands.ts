import {
    closeHellWindow,
    createHellWindow,
    sendToHellWindow,
    type HellApp,
} from './windows/window-manager'

/**
 * The ONLY way the outside world can make the Target do anything: commands from the
 * backend. Nothing else is ever listened to (no ports, no files, no other messages).
 *
 * Every command is validated twice: by the backend (CommandCatalogue.kt) and again here,
 * because the Target treats even its own backend as untrusted input.
 */

export interface Command {
    id: string
    command: string
    args: Record<string, string>
}

export interface CommandResult {
    ok: boolean
    message: string
}

/**
 * Strictly parses a raw WebSocket frame. Anything that is not exactly a well-formed
 * `command` message returns null and is silently ignored.
 */
export function parseCommand(raw: string): Command | null {
    let value: unknown

    try {
        value = JSON.parse(raw)
    } catch {
        return null
    }

    if (typeof value !== 'object' || value === null) return null

    const object = value as Record<string, unknown>

    if (object.type !== 'command') return null
    if (typeof object.id !== 'string' || object.id.length === 0 || object.id.length > 64) return null
    if (typeof object.command !== 'string' || !/^[a-z_]{1,40}$/.test(object.command)) return null

    // A prototype-less object, so a hostile key like "__proto__" is just a normal key.
    const args: Record<string, string> = Object.create(null)

    if (object.args !== undefined && object.args !== null) {
        if (typeof object.args !== 'object' || Array.isArray(object.args)) return null

        const entries = Object.entries(object.args as Record<string, unknown>)
        if (entries.length > 10) return null

        for (const [key, entry] of entries) {
            if (!/^[a-z_]{1,30}$/.test(key)) return null
            if (typeof entry !== 'string' || entry.length > 1000) return null

            args[key] = entry
        }
    }

    return { id: object.id, command: object.command, args }
}

/* ------------------------------------------------------------------ */
/* Argument helpers                                                    */
/* ------------------------------------------------------------------ */

const CONTENT_APPS = ['settings', 'defender'] as const
const ALL_APPS = ['settings', 'defender', 'update'] as const

function choice<T extends string>(
    value: string | undefined,
    allowed: readonly T[],
    name: string,
): T {
    if (value === undefined || !(allowed as readonly string[]).includes(value)) {
        throw new Error(`Invalid ${name}`)
    }

    return value as T
}

function text(
    value: string | undefined,
    name: string,
    max: number,
    required: boolean,
): string {
    const trimmed = (value ?? '').trim()

    if (required && trimmed.length === 0) throw new Error(`Missing ${name}`)
    if (trimmed.length > max) throw new Error(`${name} is too long`)

    return trimmed
}

function lines(value: string): string {
    return JSON.stringify(
        value
            .split('\n')
            .map(line => line.trim())
            .filter(line => line.length > 0)
            .slice(0, 8),
    )
}

/* ------------------------------------------------------------------ */
/* Handlers                                                            */
/* ------------------------------------------------------------------ */

type Handler = (args: Record<string, string>) => Promise<string> | string

/** A Map (not an object) so names like "constructor" or "__proto__" can never match. */
const HANDLERS = new Map<string, Handler>([
    ['ping', () => 'pong'],

    [
        'open_window',
        args => {
            const appType: HellApp = choice(args.app, CONTENT_APPS, 'window')
            createHellWindow(appType)
            return `Opened ${appType}`
        },
    ],

    [
        'close_window',
        args => {
            const appType: HellApp = choice(args.app, ALL_APPS, 'window')
            return closeHellWindow(appType) ? `Closed ${appType}` : `${appType} was not open`
        },
    ],

    [
        'show_update_screen',
        () => {
            createHellWindow('update')
            return 'Update screen is showing'
        },
    ],

    [
        'hide_update_screen',
        () => (closeHellWindow('update') ? 'Update screen closed' : 'Update screen was not open'),
    ],

    [
        'show_message',
        async args => {
            const appType: HellApp = choice(args.app, CONTENT_APPS, 'window')
            const headline = text(args.headline, 'headline', 200, true)
            const detail = text(args.detail, 'detail', 1000, false)

            await sendToHellWindow(appType, 'show_message', {
                headline,
                detail: lines(detail),
            })

            return `Message shown in ${appType}`
        },
    ],

    [
        'show_toast',
        async args => {
            const appType: HellApp = choice(args.app, CONTENT_APPS, 'window')
            const title = text(args.title, 'title', 200, true)
            const body = text(args.body, 'body', 1000, false)

            await sendToHellWindow(appType, 'show_toast', {
                title,
                body: lines(body),
            })

            return `Notification shown in ${appType}`
        },
    ],
])

export async function executeCommand(
    command: string,
    args: Record<string, string>,
): Promise<CommandResult> {
    const handler = HANDLERS.get(command)

    if (!handler) return { ok: false, message: `Unknown command: ${command}` }

    try {
        return { ok: true, message: await handler(args) }
    } catch (error) {
        return {
            ok: false,
            message: error instanceof Error ? error.message : 'Command failed',
        }
    }
}
