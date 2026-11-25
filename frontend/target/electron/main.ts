import { app } from 'electron'
import { startBackendClient } from './backend-client'
import { registerIpc } from './ipc'
import { createHellWindow } from './windows/window-manager'

process.env.APP_ROOT = app.getAppPath()

export const VITE_DEV_SERVER_URL = process.env.VITE_DEV_SERVER_URL

/*
 * The Target starts with NO windows. It sits invisibly in the background, connects out to
 * the backend, and shows Settings / Windows Security / the fake update screen only when a
 * Manager command says so.
 */
if (!app.requestSingleInstanceLock()) {
  app.quit()
} else {
  app.whenReady().then(() => {
    registerIpc()
    startBackendClient()

    // Local UI development without a backend: HELL_LOCAL_DEV=1 npm run dev
    if (process.env.HELL_LOCAL_DEV === '1') {
      createHellWindow('settings')
      createHellWindow('defender')
    }
  })
}

// Closing every window must NOT end the Target: it keeps running until the VM is reverted.
app.on('window-all-closed', () => {
  // intentionally empty
})
