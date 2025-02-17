import { BrowserWindow, ipcMain, systemPreferences } from "electron"
import * as path from "path"

export class Window {
    win: BrowserWindow

    constructor(width: number, height: number, devTools: boolean) {
        this.win = new BrowserWindow({
            width: width,
            height: height,
            minWidth: 518,
            minHeight: 350,
            title: "Surfer",
            center: true,
            webPreferences: {
                preload: path.join(__dirname, "preload.js"),
            },
            titleBarStyle: "hiddenInset",
            backgroundColor: "#FFFFFF",
            show: false
        })
        
        this.win.once('ready-to-show', () => {
            this.win.show()
        })
        
        this.win.loadFile(path.join(__dirname, "../pages/index.html"))
        
        if (devTools) {
            this.win.webContents.openDevTools({mode: 'undocked'})
        }

        this.win.on('focus', () => {
            this.win.webContents.send('windowFocused')
            ipcMain.emit('windowFocused')
        })
        
        this.win.on('blur', () => {
            this.win.webContents.send('windowBlurred')
            ipcMain.emit('closeSettings')
        })

        ipcMain.on('closedSettings', () => {
            this.win.webContents.send('windowBlurred')
        })

        ipcMain.on('lockButtonPressed', (_ev: Event, isOn: boolean) => {
            this.win.webContents.send('lockButtonPressed', isOn)
        })

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
    }

    setTheme(theme: 'dark' | 'light'): void {
        this.win.webContents.send('setTheme', theme)
    }
}