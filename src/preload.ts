import { contextBridge, ipcRenderer, IpcRendererEvent } from "electron"

contextBridge.exposeInMainWorld('api', {

    titleBarClicked: () => ipcRenderer.send('closeSettings'),

    handleRemoveLeftMargin: (callback: () => void) => ipcRenderer.on('removeLeftMargin', callback),
    handleRestoreLeftMargin: (callback: () => void) => ipcRenderer.on('restoreLeftMargin', callback),

    handleSetSearchBar: (callback: (_ev: Event, text: string) => void) => ipcRenderer.on('setSearchBar', callback),
    handleSetSearchBarURL: (callback: (_ev: Event, text: string) => void) => ipcRenderer.on('setSearchBarURL', callback),

    backButtonPressed: () => ipcRenderer.send('goBack'),
    forwardButtonPressed: () => ipcRenderer.send('goForward'),
    refreshButtonPressed: () => ipcRenderer.send('refreshPage'),
    lockButtonPressed: () => ipcRenderer.send('lockButtonPressed'),

    handleCanGoBack: (callback: () => void) => ipcRenderer.on('canGoBack', callback),
    handleCanGoForward: (callback: () => void) => ipcRenderer.on('canGoForward', callback),

    searchBarQueryEntered: (query: string) => ipcRenderer.send('searchBarQueryEntered', query),

    titleBarDoubleClicked: () => ipcRenderer.send('titleBarDoubleClicked'),

    toggleSettings: () => ipcRenderer.send('toggleSettings'),

    handleSetTheme: (callback: (_ev: IpcRendererEvent, theme: 'dark' | 'light') => void) => ipcRenderer.on('setTheme', callback),

    handleStartedLoading: (callback: () => void) => ipcRenderer.on('startedLoading', callback),

    handleFinishedLoading: (callback: () => void) => ipcRenderer.on('finishedLoading', callback),
})
