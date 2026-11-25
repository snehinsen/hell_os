import { app, BrowserWindow } from 'electron'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { report } from '../report'

const currentDir = path.dirname(fileURLToPath(import.meta.url))

const PRELOAD_PATH = path.join(currentDir, 'preload.mjs')
const DEV_SERVER_URL = process.env.VITE_DEV_SERVER_URL

export type HellApp = 'settings' | 'defender' | 'update'

const windows = new Map<HellApp, BrowserWindow>()

const LABELS: Record<HellApp, string> = {
    settings: 'Settings',
    defender: 'Windows Security',
    update: 'Update screen',
}

/*
 * Settings and Windows Security are UWP apps on real Windows 10: no native
 * frame, a custom title bar (back arrow + title) and the system caption
 * buttons drawn on top. `titleBarStyle: 'hidden'` + `titleBarOverlay` gives
 * exactly that; the renderer draws the left part (see components/TitleBar).
 * The overlay colour must match the title bar background in the renderer.
 * The VM is always in dark mode, so everything here is dark.
 *
 * The `title` of each window is what Alt+Tab and the taskbar show, so it must
 * be exactly what the real app is called (see also the page-title-updated
 * handler below, which stops the web page from overriding it).
 */
const windowConfig: Record<HellApp, Electron.BrowserWindowConstructorOptions> = {
    settings: {
        width: 1050,
        height: 720,
        minWidth: 800,
        minHeight: 550,
        title: 'Settings',
        backgroundColor: '#000000',
        titleBarStyle: 'hidden',
        titleBarOverlay: {
            color: '#000000',
            symbolColor: '#FFFFFF',
            height: 32,
        },
    },

    defender: {
        width: 950,
        height: 680,
        minWidth: 750,
        minHeight: 500,
        title: 'Windows Security',
        backgroundColor: '#000000',
        titleBarStyle: 'hidden',
        titleBarOverlay: {
            color: '#000000',
            symbolColor: '#FFFFFF',
            height: 32,
        },
    },

    /*
     * The fake "Working on updates" screen.
     *  - type: 'toolbar' makes Windows treat it as a tool window
     *    (WS_EX_TOOLWINDOW), which Alt+Tab does not list.
     *  - skipTaskbar keeps it off the taskbar too.
     */
    update: {
        width: 1024,
        height: 768,
        title: 'Windows Update',
        fullscreen: true,
        frame: false,
        autoHideMenuBar: true,
        backgroundColor: '#0078D7',
        type: 'toolbar',
        skipTaskbar: true,
    },
}

const lastFocusReport = new Map<HellApp, number>()

export function createHellWindow(appType: HellApp): BrowserWindow {
    const existing = windows.get(appType)

    if (existing && !existing.isDestroyed()) {
        // A minimised window must be restored, or focus() does nothing visible.
        if (existing.isMinimized()) existing.restore()
        existing.show()
        existing.focus()
        return existing
    }

    const window = new BrowserWindow({
        ...windowConfig[appType],

        webPreferences: {
            preload: PRELOAD_PATH,
            contextIsolation: true,
            nodeIntegration: false,
            sandbox: true,
        },
    })

    windows.set(appType, window)
    window.menuBarVisible = false
    report('window_opened', `${LABELS[appType]} window opened`)

    // Keep the native window title (shown in Alt+Tab / taskbar) fixed; never
    // let the web page's <title> / document.title replace it.
    window.on('page-title-updated', event => {
        event.preventDefault()
    })

    // Tell the human watching when the person in the VM switches to a window.
    window.on('focus', () => {
        const now = Date.now()

        if (now - (lastFocusReport.get(appType) ?? 0) > 5_000) {
            lastFocusReport.set(appType, now)
            report('window_focused', `${LABELS[appType]} window focused`)
        }
    })

    window.on('closed', () => {
        windows.delete(appType)
        report('window_closed', `${LABELS[appType]} window closed`)
    })

    if (DEV_SERVER_URL) {
        const url = new URL(DEV_SERVER_URL)
        url.searchParams.set('app', appType)

        window.loadURL(url.toString())
    } else {
        window.loadFile(
            path.join(app.getAppPath(), 'dist', 'index.html'),
            {
                query: {
                    app: appType,
                },
            },
        )
    }

    return window
}

export function createAllHellWindows(): void {
    createHellWindow('settings')
    createHellWindow('defender')
    createHellWindow('update')
}

/** Closes one window. False if it wasn't open. */
export function closeHellWindow(appType: HellApp): boolean {
    const existing = windows.get(appType)

    if (!existing || existing.isDestroyed()) return false

    existing.close()
    return true
}

/**
 * Delivers a command to a window's renderer (e.g. "show this message box"),
 * opening the window first if necessary and waiting until the page has loaded.
 */
export async function sendToHellWindow(
    appType: HellApp,
    command: string,
    args: Record<string, string>,
): Promise<void> {
    const alreadyOpen = windows.has(appType)
    const window = createHellWindow(appType)

    if (window.webContents.isLoading()) {
        await new Promise<void>(resolve => {
            window.webContents.once('did-finish-load', () => resolve())
        })
    }

    // A freshly created window needs a moment for React to mount and subscribe.
    if (!alreadyOpen) {
        await new Promise<void>(resolve => setTimeout(resolve, 700))
    }

    if (!window.isDestroyed()) {
        window.webContents.send('hell:command', { command, args })
    }
}

export function closeAllHellWindows(): void {
    for (const window of windows.values()) {
        if (!window.isDestroyed()) {
            window.close()
        }
    }

    windows.clear()
}

export function getHellWindow(appType: HellApp): BrowserWindow | undefined {
    return windows.get(appType)
}

export function getOpenHellWindows(): HellApp[] {
    return [...windows.keys()]
}
