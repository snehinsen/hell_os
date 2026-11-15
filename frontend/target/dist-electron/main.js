import { BrowserWindow, app, ipcMain } from "electron";
import path from "node:path";
import { fileURLToPath } from "node:url";
const currentDir = path.dirname(fileURLToPath(import.meta.url));
const PRELOAD_PATH = path.join(currentDir, "preload.mjs");
const DEV_SERVER_URL = process.env.VITE_DEV_SERVER_URL;
const windows = /* @__PURE__ */ new Map();
const windowConfig = {
  settings: {
    width: 1050,
    height: 720,
    minWidth: 800,
    minHeight: 550,
    title: "Settings",
    backgroundColor: "#000000",
    titleBarStyle: "hidden",
    titleBarOverlay: {
      color: "#000000",
      symbolColor: "#FFFFFF",
      height: 32
    }
  },
  defender: {
    width: 950,
    height: 680,
    minWidth: 750,
    minHeight: 500,
    title: "Windows Security",
    backgroundColor: "#000000",
    titleBarStyle: "hidden",
    titleBarOverlay: {
      color: "#000000",
      symbolColor: "#FFFFFF",
      height: 32
    }
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
    title: "Windows Update",
    fullscreen: true,
    frame: false,
    autoHideMenuBar: true,
    backgroundColor: "#0078D7",
    type: "toolbar",
    skipTaskbar: true
  }
};
function createHellWindow(appType) {
  const existing = windows.get(appType);
  if (existing && !existing.isDestroyed()) {
    if (existing.isMinimized()) existing.restore();
    existing.show();
    existing.focus();
    return existing;
  }
  const window = new BrowserWindow({
    ...windowConfig[appType],
    webPreferences: {
      preload: PRELOAD_PATH,
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true
    }
  });
  windows.set(appType, window);
  window.menuBarVisible = false;
  window.on("page-title-updated", (event) => {
    event.preventDefault();
  });
  window.webContents.on("did-finish-load", () => {
    window.webContents.send(
      "main-process-message",
      (/* @__PURE__ */ new Date()).toLocaleString()
    );
  });
  window.on("closed", () => {
    windows.delete(appType);
  });
  if (DEV_SERVER_URL) {
    const url = new URL(DEV_SERVER_URL);
    url.searchParams.set("app", appType);
    window.loadURL(url.toString());
  } else {
    window.loadFile(
      path.join(app.getAppPath(), "dist", "index.html"),
      {
        query: {
          app: appType
        }
      }
    );
  }
  return window;
}
function createAllHellWindows() {
  createHellWindow("settings");
  createHellWindow("defender");
  createHellWindow("update");
}
const OPENABLE_FROM_RENDERER = ["settings", "defender"];
function isOpenable(value) {
  return typeof value === "string" && OPENABLE_FROM_RENDERER.includes(value);
}
function registerIpc() {
  ipcMain.handle("hell:open-app", (_event, appType) => {
    if (!isOpenable(appType)) return false;
    createHellWindow(appType);
    return true;
  });
}
process.env.APP_ROOT = app.getAppPath();
const VITE_DEV_SERVER_URL = process.env.VITE_DEV_SERVER_URL;
app.whenReady().then(() => {
  registerIpc();
  createAllHellWindows();
  app.on("activate", () => {
    createAllHellWindows();
  });
});
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
export {
  VITE_DEV_SERVER_URL
};
