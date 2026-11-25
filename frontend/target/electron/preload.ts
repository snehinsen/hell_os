import { contextBridge, ipcRenderer } from 'electron'

/**
 * The only things a renderer can do. Keep this surface tiny: no Node, no
 * arbitrary channels, no file system.
 */
contextBridge.exposeInMainWorld('hell', {
  onMainProcessMessage(callback: (message: string) => void) {
    const listener = (_event: Electron.IpcRendererEvent, message: string) => {
      callback(message)
    }

    ipcRenderer.on('main-process-message', listener)

    return () => {
      ipcRenderer.removeListener('main-process-message', listener)
    }
  },

  /** A Manager command aimed at this window (show a message box, a notification...). */
  onCommand(callback: (command: string, args: Record<string, string>) => void) {
    const listener = (
      _event: Electron.IpcRendererEvent,
      payload: { command: string; args: Record<string, string> },
    ) => {
      callback(payload.command, payload.args)
    }

    ipcRenderer.on('hell:command', listener)

    return () => {
      ipcRenderer.removeListener('hell:command', listener)
    }
  },

  /** Tell the human watching about something that just happened. Fire and forget. */
  report(kind: string, summary: string, detail?: string): void {
    ipcRenderer.send('hell:report', { kind, summary, detail })
  },

  /** Open (or focus) the Settings or Windows Security window. */
  openApp(appType: 'settings' | 'defender'): Promise<boolean> {
    return ipcRenderer.invoke('hell:open-app', appType)
  },
})
