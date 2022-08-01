import { BrowserWindow, ipcMain, nativeTheme, systemPreferences } from "electron"
import * as path from "path"

export class Window {
    win: BrowserWindow

    constructor(width: number, height: number, devTools: boolean, theme: string) {
        this.win = new BrowserWindow({
            width: width,
            height: height,
            // x: 843,
            // y: 0,
            minWidth: 523,
            minHeight: 350,
            title: "Surfer",
            webPreferences: {
                preload: path.join(__dirname, "preload.js"),
            },
            titleBarStyle: "hiddenInset",
            backgroundColor: (theme === "dark") ? "#262626" : "#dadada",
        })
        
        this.win.loadFile(path.join(__dirname, "../pages/index.html"))
        
        if (devTools) {
            this.win.webContents.openDevTools({mode: 'undocked'})
        }

        ipcMain.on('titleBarDoubleClicked', () => {
            const doubleClickAction = systemPreferences.getUserDefault('AppleActionOnDoubleClick', 'string')
            if (doubleClickAction === 'Minimize') {
                this.win.minimize()
            } else if (doubleClickAction === 'Maximize') {
                if (!this.win.isMaximized()) {
                this.win.maximize()
                } else {
                    this.win.unmaximize()
                }
            }
        })

        if (process.platform === 'darwin') {
            this.win.on('enter-full-screen', () => {
                this.win.webContents.send('removeLeftMargin')
            })
            this.win.on('leave-full-screen', () => {
                this.win.webContents.send('restoreLeftMargin')
            })
        } else {
            this.win.webContents.send('removeLeftMargin')
        }

        // this.win.webContents.send('setTheme', 'light')
        // this.win.webContents.send('setTheme', 'dark')
    }

    setTheme(theme: 'dark' | 'light'): void {
        this.win.webContents.send('setTheme', theme)
    }
}