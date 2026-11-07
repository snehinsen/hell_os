import { contextBridge, ipcRenderer } from 'electron'

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
})