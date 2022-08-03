import { contextBridge, ipcRenderer, IpcRendererEvent } from "electron"

contextBridge.exposeInMainWorld('api', {
    onSetTheme: (callback: (_ev: IpcRendererEvent, theme: 'dark' | 'light') => void) => ipcRenderer.on('setTheme', callback),
    toggleTheme: (theme: 'dark' | 'light') => ipcRenderer.send('toggleTheme', theme),
})