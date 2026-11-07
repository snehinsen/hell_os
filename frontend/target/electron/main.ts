import { app } from 'electron'
import { createAllHellWindows } from './windows/window-manager'

process.env.APP_ROOT = app.getAppPath()

export const VITE_DEV_SERVER_URL = process.env.VITE_DEV_SERVER_URL

app.whenReady().then(() => {
  createAllHellWindows()

  app.on('activate', () => {
    createAllHellWindows()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})