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

function setUserAgent(view: BrowserView): void {
    const userAgent = view.webContents.getUserAgent()

    let surferVersion = userAgent.substring(userAgent.indexOf('Surfer/'))
    surferVersion = surferVersion.substring(0, surferVersion.indexOf(' '))
    let newUserAgent = userAgent.replace(surferVersion, 'Surfer/0.1.0')
    let electronAgent = newUserAgent.substring(newUserAgent.indexOf('Electron/'))
    electronAgent = electronAgent.substring(0, electronAgent.indexOf(' '))
    newUserAgent = newUserAgent.replace(' ' + electronAgent, '')

    if (newUserAgent.length > 15) { // as of some new Electron version (19.0.6 i think?) the getUserAgent() method returns an empty string, and so the user agent would only include Surfer/0.1.0 agent and nothing else, which makes google load an old interface (or mobile interface for the search page idk)
        app.userAgentFallback = newUserAgent
    } else {
        app.userAgentFallback = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_6) AppleWebKit/537.36 (KHTML, like Gecko) Surfer/0.1.0 Chrome/102.0.5005.167 Safari/537.36'
    }
}

function setTheme() {
    // nativeTheme.themeSource = 'light'
    nativeTheme.themeSource = 'dark'
    
    // win.setTheme('dark')

    // const checkTime = () => {
    //     const currentTime = new Date()
    //     const hours = currentTime.getHours()
    //     if (hours > 20 || hours < 5) {
    //         nativeTheme.themeSource = 'dark'
    //         win.setTheme('dark')
    //         console.log('Setting the theme to dark')
    //     } else {
    //         nativeTheme.themeSource = 'light'
    //         win.setTheme('light')
    //         console.log('Setting the theme to light')
    //     }
    // }

    // checkTime()
    // setInterval(checkTime, 60000)
}

function createWindow() {
    app.setName('Surfer')

    win = new Window(800, 600, false, 'light')
    view = new View(800, 600, 37, win.win)

    setUserAgent(view.view)

    // win = new Window(523, 745, false)
    // view = new View(523, 745, 37, win.win)
    
    let settingsDropdown: OverlayView = null
    
    ipcMain.on('toggleSettings', () => {
        if (settingsDropdown == null) {
            settingsDropdown = new OverlayView(660, 35, 130, 116, '../pages/settings.html', win.win, 'dark')
        } else {
            settingsDropdown.destruct()
            settingsDropdown = null
        }
    })

    ipcMain.on('toggleTheme', (_ev: Event, theme: string) => {
        console.log('toggleTheme', theme)
    })

    setTheme()
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

