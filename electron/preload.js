const { contextBridge, ipcMain } = require('electron');

contextBridge.exposeInMainWorld('electron', {
  ipcMain
});
