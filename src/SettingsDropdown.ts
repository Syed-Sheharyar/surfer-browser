import { BrowserView, BrowserWindow, ipcMain } from "electron"
import * as path from "path"

export class SettingsDropdown {
    view: BrowserView
    win: BrowserWindow
    v: BrowserView
    open: boolean
    canOpen: boolean
    constructor(xMargin: number, yMargin: number, width: number, height: number, fileName: string, win: BrowserWindow, v: BrowserView, theme: 'dark' | 'light') {
        ipcMain.once('loadedView', () => {
            this.view = new BrowserView({webPreferences: {preload: path.join(__dirname, "settingsPreload.js")}})
            this.win = win
            this.v = v

            let y = this.v.getBounds().y + yMargin

            this.win.addBrowserView(this.view)
            this.view.setBounds({ x: this.win.getBounds().width - xMargin - width, y: y, width: width, height: height })
            
            this.hide()
            
            this.view.webContents.send('setTheme', theme)
            
            ipcMain.on('toggleSettings', () => {
                if (this.open) {
                    this.hide()
                } else {
                    if (this.canOpen) {
                        this.show()
                    }
                }
            })

            ipcMain.on('lockButtonPressed', () => {
                y = this.v.getBounds().y + yMargin
                this.view.setBounds({ x: this.win.getBounds().width - xMargin - width, y: y, width: width, height: height })
            })

            // this.view.webContents.openDevTools()

            this.view.webContents.loadFile(path.join(__dirname, fileName))

            this.win.on('resize', () => {
                this.view.setBounds({ x: this.win.getBounds().width - xMargin - width, y: y, width: width, height: height })
            })

            this.view.webContents.on('blur', () => {
                this.hide()
            })
        })
    }

    show(): void {
        this.open = true
        this.win.setTopBrowserView(this.view)
        this.view.webContents.send('show')

        this.view.webContents.focus()
    }
    
    hide(): void {
        if (this.open) {
            ipcMain.emit('closedSettings')
        }
        this.open = false
        this.win.setTopBrowserView(this.v)
        this.view.webContents.send('hide')

        this.canOpen = false
        setTimeout(() => {
            this.canOpen = true
        }, 100)
    }
}
