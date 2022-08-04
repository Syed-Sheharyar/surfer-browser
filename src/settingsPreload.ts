import { contextBridge, ipcRenderer, IpcRendererEvent } from "electron"

contextBridge.exposeInMainWorld('api', {
    onSetTheme: (callback: (_ev: IpcRendererEvent, theme: 'dark' | 'light') => void) => ipcRenderer.on('setTheme', callback),
    toggleTheme: (theme: 'dark' | 'light') => ipcRenderer.send('toggleTheme', theme),

    onShow: (callback: () => void) => ipcRenderer.on('show', callback),
    onHide: (callback: () => void) => ipcRenderer.on('hide', callback),
})