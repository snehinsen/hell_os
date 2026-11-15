"use strict";
const electron = require("electron");
electron.contextBridge.exposeInMainWorld("hell", {
  onMainProcessMessage(callback) {
    const listener = (_event, message) => {
      callback(message);
    };
    electron.ipcRenderer.on("main-process-message", listener);
    return () => {
      electron.ipcRenderer.removeListener("main-process-message", listener);
    };
  },
  /** Open (or focus) the Settings or Windows Security window. */
  openApp(appType) {
    return electron.ipcRenderer.invoke("hell:open-app", appType);
  }
});
