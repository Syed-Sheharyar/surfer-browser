import { app, BrowserView, ipcMain, IpcRendererEvent, nativeTheme } from "electron"

import { Window } from "./Window"
import { View } from "./View"
import { SettingsDropdown } from "./SettingsDropdown"

// Renderer preload API declaration. Enables autocomplete and Typescript safety. 
// You usually would want to keep it collapsed.
declare global {
    interface Window {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        api?: {

            // Browser UI

            titleBarClicked: () => void,

            handleRemoveLeftMargin: (callback: () => void) => void,
            handleRestoreLeftMargin: (callback: () => void) => void,

            handleSetSearchBar: (callback: (_ev: Event, text: string) => void) => void,
            handleSetSearchBarURL: (callback: (_ev: Event, text: string) => void) => void,

            backButtonPressed: () => void,
            forwardButtonPressed: () => void,
            refreshButtonPressed: () => void,
            lockButtonPressed: () => void,

            handleCanGoBack: (callback: (_ev: IpcRendererEvent, canGoBack: boolean) => void) => void,
            handleCanGoForward: (callback: (_ev: IpcRendererEvent, canGoForward: boolean) => void) => void,

            handleWindowFocusedOrBlurred: (callback: () => void) => void,

            searchBarQueryEntered: (query: string) => void,

            titleBarDoubleClicked: () => void,

            toggleSettings: () => void,

            handleSetTheme: (callback: (_ev: IpcRendererEvent, theme: 'dark' | 'light') => void) => void,

            handleStartedLoading: (callback: () => void) => void,

            handleFinishedLoading: (callback: () => void) => void,

            // Settings

            goHome: () => void,
            openSettings: () => void,

            onSetTheme: (callback: (_ev: IpcRendererEvent, theme: 'dark' | 'light') => void) => void,
            toggleTheme: (theme: 'dark' | 'light') => void,

            onShow: (callback: () => void) => void,
            onHide: (callback: () => void) => void,
        }
    }
}

let win: Window
let view: View

function setUserAgent(): void {
    let v = new BrowserView
    const userAgent = v.webContents.getUserAgent()
    v = null

    let surferVersion = userAgent.substring(userAgent.indexOf('Surfer/'))
    surferVersion = surferVersion.substring(0, surferVersion.indexOf(' '))
    let newUserAgent = userAgent.replace(surferVersion, 'Surfer/0.1.0')
    let electronAgent = newUserAgent.substring(newUserAgent.indexOf('Electron/'))
    electronAgent = electronAgent.substring(0, electronAgent.indexOf(' '))
    newUserAgent = newUserAgent.replace(' ' + electronAgent, '')

    app.userAgentFallback = newUserAgent
    if (newUserAgent.length > 15) { // some Electron versions have a bug which doesn't return a default user agent when calling webContents.getUserAgent()
    } else {
        app.userAgentFallback = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_6) AppleWebKit/537.36 (KHTML, like Gecko) Surfer/0.1.0 Chrome/102.0.5005.167 Safari/537.36'
    }
}

let settingsDropdown: SettingsDropdown = null

function setTheme(theme: 'dark' | 'light') {
    nativeTheme.themeSource = theme
    win.setTheme(theme)
}

let theme: 'dark' | 'light' = 'light'

function createWindow() {
    app.setName('Surfer')

    setUserAgent()

    win = new Window(800, 600, false, theme)
    view = new View(800, 600, 37, win.win)

    // Create the settings dropdown 1 second after creating the BrowserView to make sure
    // the page is loaded and the dropdown wouldn't be visible in the process of its creation. 
    // (It's unlikely I can do anything about it considering the way it's implemented right now.)

    setTimeout(() => {
        settingsDropdown = new SettingsDropdown(10, 47, 127, 116, '../pages/settings.html', win.win, view.view, theme)
        
        ipcMain.on('toggleSettings', () => {
            if (settingsDropdown.open) {
                settingsDropdown.hide()
            } else {
                settingsDropdown.show()
            }
        })
        
    }, 1000)

    // To-do separate theme handling logic into a seperate file/class.
    
    ipcMain.on('toggleTheme', (_ev: Event, t: 'dark' | 'light') => {
        theme = t
        setTheme(theme)
    })
    
    setTheme(theme)
    
    // When the window is created, it's given a background color according
    // to its theme (not the simple black/white). But it makes the pages that have no background (transparent)
    // appear incorrectly as they usually assume the background to be white.
    win.win.on('ready-to-show', () => {
        win.win.setBackgroundColor(theme === 'dark' ? '#000000' : '#FFFFFF')
    })
    
}

app.on("ready", () => {

    createWindow()

    // UNCOMMENT IN PRODUCTION! This is a useful feature for users in production,
    // but an annoying thing for me in development

    // app.on("activate", function () {
    //     // On macOS it's common to re-create a window in the app when the
    //     // dock icon is clicked and there are no other windows open.
    //     if (BrowserWindow.getAllWindows().length === 0) {
    //         createWindow()
    //     }
    // })
})

// Uncomment in production.

// app.on("window-all-closed", () => {
//     if (process.platform !== "darwin") {
//         app.quit()
//     }
// })

