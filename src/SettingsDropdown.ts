import { BrowserView, BrowserWindow, ipcMain } from "electron"
import * as path from "path"

export class SettingsDropdown {
    view: BrowserView
    win: BrowserWindow
    v: BrowserView
    open: boolean
    constructor(xMargin: number, y: number, width: number, height: number, fileName: string, win: BrowserWindow, v: BrowserView, theme: 'dark' | 'light') {
        this.view = new BrowserView({webPreferences: {preload: path.join(__dirname, "settingsPreload.js")}})
        this.win = win
        this.v = v

        this.win.addBrowserView(this.view)
        this.view.setBounds({ x: this.win.getBounds().width - xMargin - width, y: y, width: width, height: height })
        this.view.webContents.send('setTheme', theme)

        this.hide()
        // this.open = true

        ipcMain.on('closeSettings', () => {
            this.hide()
        })

        // this.view.webContents.openDevTools()
        
        this.view.webContents.loadFile(path.join(__dirname, fileName))
        
        this.win.on('resize', () => {
            this.view.setBounds({ x: this.win.getBounds().width - xMargin - width, y: y, width: width, height: height })
        })
    }

    show(): void {
        this.open = true
        this.win.setTopBrowserView(this.view)
        this.view.webContents.send('show')
    }
    
    hide(): void {
        if (this.open) {
            ipcMain.emit('closedSettings')
        }
        this.open = false
        this.win.setTopBrowserView(this.v)
        this.view.webContents.send('hide')
    }
}
