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

  /** Open (or focus) the Settings or Windows Security window. */
  openApp(appType: 'settings' | 'defender'): Promise<boolean> {
    return ipcRenderer.invoke('hell:open-app', appType)
  },
})
