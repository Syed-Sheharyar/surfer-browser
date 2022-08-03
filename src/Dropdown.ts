import { BrowserView, BrowserWindow } from "electron"
import * as path from "path"

export class OverlayView {
    view: BrowserView
    win: BrowserWindow
    constructor(x: number, y: number, width: number, height: number, fileName: string, win: BrowserWindow, theme: 'dark' | 'light') {
        this.view = new BrowserView({webPreferences: {preload: path.join(__dirname, "settingsPreload.js")}})
        this.win = win
        this.win.addBrowserView(this.view)
        this.view.setBounds({ x: x, y: y, width: width, height: height })
        this.view.webContents.send('setTheme', theme)
        // this.view.webContents.openDevTools()
        
        this.view.webContents.loadFile(path.join(__dirname, fileName))
        
    }

    destruct(): void {
        this.win.removeBrowserView(this.view)
        this.view = null
        this.win = null
    }
}