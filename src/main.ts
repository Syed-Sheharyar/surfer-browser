import { app, BrowserView, ipcMain, nativeTheme } from "electron"

import { Window } from "./Window"
import { View } from "./View"
import { OverlayView } from "./Dropdown"

declare global {
    interface Window {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        api?: any
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

let settingsDropdown: OverlayView = null

function setTheme(theme: 'dark' | 'light') {
    nativeTheme.themeSource = theme
    win.setTheme(theme)
}

let theme: 'dark' | 'light' = 'dark'

function createWindow() {
    app.setName('Surfer')

    setUserAgent()

    win = new Window(800, 600, false, theme)
    view = new View(800, 600, 37, win.win)

    settingsDropdown = new OverlayView(10, 35, 130, 116, '../pages/settings.html', win.win, view.view, theme)

    ipcMain.on('toggleSettings', () => {
        if (settingsDropdown.open) {
            settingsDropdown.hide()
        } else {
            settingsDropdown.show()
        }
    })

    ipcMain.on('toggleTheme', (_ev: Event, t: 'dark' | 'light') => {
        theme = t
        console.log('toggleTheme', theme)
        setTheme(theme)
    })

    setTheme(theme)

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

