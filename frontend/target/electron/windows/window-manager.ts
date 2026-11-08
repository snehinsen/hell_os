import { app, BrowserWindow } from 'electron'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const currentDir = path.dirname(fileURLToPath(import.meta.url))

const PRELOAD_PATH = path.join(currentDir, 'preload.mjs')
const DEV_SERVER_URL = process.env.VITE_DEV_SERVER_URL

export type HellApp = 'settings' | 'defender' | 'update'

const windows = new Map<HellApp, BrowserWindow>()

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

export function createHellWindow(appType: HellApp): BrowserWindow {
    const existing = windows.get(appType)

    if (existing && !existing.isDestroyed()) {
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

    // Keep the native window title (shown in Alt+Tab / taskbar) fixed; never
    // let the web page's <title> / document.title replace it.
    window.on('page-title-updated', event => {
        event.preventDefault()
    })

    window.webContents.on('did-finish-load', () => {
        window.webContents.send(
            'main-process-message',
            new Date().toLocaleString(),
        )
    })

    window.on('closed', () => {
        windows.delete(appType)
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
