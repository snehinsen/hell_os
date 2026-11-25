import { ipcMain } from 'electron'
import { report } from './report'
import { createHellWindow, type HellApp } from './windows/window-manager'

/**
 * The renderer's entire view of the main process. Nothing here exposes Node, the file
 * system or arbitrary channels, and none of it can be driven from the network: the only
 * thing that can reach the network is the backend client, which accepts commands only.
 *
 * Windows a renderer may open itself (the Settings "Open Windows Security" button).
 * The fake Update window is deliberately NOT here: only the Manager may trigger it.
 */
const OPENABLE_FROM_RENDERER: HellApp[] = ['settings', 'defender']

function isOpenable(value: unknown): value is HellApp {
    return (
        typeof value === 'string' &&
        (OPENABLE_FROM_RENDERER as string[]).includes(value)
    )
}

// Renderers can be spammed by whoever is sitting in front of them: cap what they can report.
let windowStart = 0
let count = 0

function withinRateLimit(): boolean {
    const now = Date.now()

    if (now - windowStart > 1_000) {
        windowStart = now
        count = 0
    }

    count++
    return count <= 20
}

export function registerIpc(): void {
    ipcMain.handle('hell:open-app', (_event, appType: unknown): boolean => {
        if (!isOpenable(appType)) return false

        report('user_action', `Opened ${appType === 'defender' ? 'Windows Security' : 'Settings'} from the UI`)
        createHellWindow(appType)
        return true
    })

    // Something happened in a window (a blocked setting, a page view...): pass it on for oversight.
    ipcMain.on('hell:report', (_event, payload: unknown) => {
        if (!withinRateLimit()) return
        if (typeof payload !== 'object' || payload === null) return

        const { kind, summary, detail } = payload as Record<string, unknown>

        if (typeof kind !== 'string' || typeof summary !== 'string') return

        const cleanKind = kind.toLowerCase().replace(/[^a-z_]/g, '').slice(0, 30) || 'event'

        report(
            `ui_${cleanKind}`,
            summary,
            typeof detail === 'string' ? detail : undefined,
        )
    })
}
