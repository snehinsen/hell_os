/// <reference types="vite-plugin-electron/electron-env" />

declare namespace NodeJS {
  interface ProcessEnv {
    /**
     * The built directory structure
     *
     * ```tree
     * ├─┬─┬ dist
     * │ │ └── index.html
     * │ │
     * │ ├─┬ dist-electron
     * │ │ ├── main.js
     * │ │ └── preload.js
     * │
     * ```
     */
    APP_ROOT: string
    /** /dist/ or /public/ */
    VITE_PUBLIC: string
  }
}

// Used in Renderer process, expose in `preload.ts`
interface Window {
  ipcRenderer: import('electron').IpcRenderer
}
export {}

declare global {
  interface Window {
    hell: {
      onMainProcessMessage(
          callback: (message: string) => void,
      ): () => void

      /** A Manager command aimed at this window. Returns an unsubscribe function. */
      onCommand(
          callback: (command: string, args: Record<string, string>) => void,
      ): () => void

      /** Tell the human watching about something that just happened. */
      report(kind: string, summary: string, detail?: string): void

      /** Open (or focus) the Settings or Windows Security window. */
      openApp(appType: 'settings' | 'defender'): Promise<boolean>
    }
  }
}
