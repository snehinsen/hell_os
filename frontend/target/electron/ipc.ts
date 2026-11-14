import { ipcMain } from 'electron'
import { createHellWindow, type HellApp } from './windows/window-manager'

/**
 * Windows a renderer is allowed to open. The fake Update window is
 * deliberately NOT here: only the Manager (via the backend) may trigger it.
 */
const OPENABLE_FROM_RENDERER: HellApp[] = ['settings', 'defender']

function isOpenable(value: unknown): value is HellApp {
    return (
        typeof value === 'string' &&
        (OPENABLE_FROM_RENDERER as string[]).includes(value)
    )
}

/**
 * Restricted IPC surface for renderers. Nothing here exposes Node, the file
 * system or arbitrary channels; every request is validated by the main process.
 */
export function registerIpc(): void {
    ipcMain.handle('hell:open-app', (_event, appType: unknown): boolean => {
        if (!isOpenable(appType)) return false

        createHellWindow(appType)
        return true
    })
}
