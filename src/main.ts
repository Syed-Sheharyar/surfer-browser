import { app, BrowserView, ipcMain, nativeTheme } from "electron"

import { Window } from "./Window"
import { View } from "./View"
import { SettingsDropdown } from "./SettingsDropdown"

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

    if (newUserAgent.length > 15) { // some Electron versions have a bug which doesn't return a default user agent when calling webContents.getUserAgent()
        app.userAgentFallback = newUserAgent
    } else {
        // app.userAgentFallback = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_6) AppleWebKit/537.36 (KHTML, like Gecko) Surfer/0.1.0 Chrome/102.0.5005.167 Safari/537.36'
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

    win = new Window(800, 600, false)
    view = new View(800, 600, 37*2-5, win.win)

    // Create the settings dropdown 1 second after creating the BrowserView to make sure
    // the page is loaded and the dropdown wouldn't be visible in the process of its creation. 
    // (It's unlikely I can do anything about it considering the way it's implemented right now.)
    // But it's fine though... surely...

    setTimeout(() => {
        settingsDropdown = new SettingsDropdown(10, 10, 127, 116, '../pages/settings.html', win.win, view.view, theme)
        
        ipcMain.on('toggleSettings', () => {
            if (settingsDropdown.open) {
                settingsDropdown.hide()
            } else {
                settingsDropdown.show()
            }
        })

        settingsDropdown.view.webContents.on('blur', () => {
            settingsDropdown.hide()
        })
        
    }, 1000)

    // To-do separate theme handling logic into a seperate file/class.
    
    ipcMain.on('toggleTheme', (_ev: Event, t: 'dark' | 'light') => {
        theme = t
        setTheme(theme)
    })
    
    setTheme(theme)
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

