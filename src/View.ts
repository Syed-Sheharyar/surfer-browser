import { BrowserView, BrowserWindow, ipcMain, dialog } from "electron"
import * as path from "path"
import { LoadingError } from "./LoadingError"

import { ElectronBlocker } from '@cliqz/adblocker-electron'
import fetch from 'cross-fetch'; // required 'fetch'

export class View {
    view: BrowserView
    homePage: boolean
    homeCount: number
    shouldEnableZoom: boolean
    constructor(width: number, height: number, tabHeight: number, win: BrowserWindow ) {
        this.view = new BrowserView({
            webPreferences: {
                nodeIntegration: false,
                sandbox: true,
                partition: 'persist:userSession',
                javascript: true,
                webSecurity: true,
                allowRunningInsecureContent: false,
                contextIsolation: true,
                safeDialogs: true,
                autoplayPolicy: 'user-gesture-required',
                minimumFontSize: 6, // Resemble Chrome's settings
                webviewTag: false,
                zoomFactor: 1.0,
                navigateOnDragDrop: true,
                scrollBounce: true,
                preload: path.join(__dirname, "viewPreload.js"),
            }
        })
        win.addBrowserView(this.view)
        this.view.setBounds({ x: 0, y: tabHeight, width: width, height: height - tabHeight })
        this.view.setAutoResize({width: true, height: true})
        this.view.webContents.setVisualZoomLevelLimits(1, 3)
        this.view.setBackgroundColor('#FFFFFF')
        
        // this.view.webContents.openDevTools()
        
        this.goHome()
        
        // ElectronBlocker.fromPrebuiltAdsAndTracking(fetch).then((blocker) => {
        //     blocker.enableBlockingInSession(this.view.webContents.session);
        // })
        
        ipcMain.on('lockButtonPressed', (_ev: Event, isOn: boolean) => {
            const bounds = win.getBounds()
            if (isOn) {
                this.view.setBounds({ x: 0, y: 37, width: bounds.width, height: bounds.height - 37 })
            } else {
                this.view.setBounds({ x: 0, y: tabHeight, width: bounds.width, height: bounds.height - tabHeight })
            }
        })
        
        this.view.webContents.on('will-navigate', (ev: Event, url: string) => {
            updateSearchBar(ev, url)
        })

        ipcMain.on('closedSettings', () => {
            this.view.webContents.focus()
        })

        ipcMain.on('windowFocused', () => {
            this.view.webContents.focus()
        })
        
        this.view.webContents.on('will-prevent-unload', (event) => {
            const choice = dialog.showMessageBoxSync({
                type: 'question',
                buttons: ['Stay', 'Leave'],
                title: 'Do you want to leave this site?',
                message: 'Changes that you made may not be saved.',
                defaultId: 0,
                cancelId: 1
            })
            const leave = (choice === 1)
            if (leave) {
              event.preventDefault()
            }
        })
        
        this.view.webContents.setWindowOpenHandler((details: Electron.HandlerDetails) => {
            // Do stuff: open a new tab, navigate current tab, etc.
            this.view.webContents.loadURL(details.url)
            return { action: 'deny' }
        })
        
        this.view.webContents.on('enter-html-full-screen', () => {
            const { width: w, height: h } = win.getBounds()
            this.view.setBounds({ x: 0, y: 0, width: w, height: h })
        })
        
        this.view.webContents.on('leave-html-full-screen', () => {
            const { width: w, height: h } = win.getBounds()
            this.view.setBounds({ x: 0, y: tabHeight, width: w, height: h - tabHeight })
        })
        
        this.view.webContents.on('did-navigate', (_ev: Event, url: string) => {
            updateSearchBar(_ev, url)
            win.webContents.send('canGoBack', this.view.webContents.canGoBack())
            win.webContents.send('canGoForward', this.view.webContents.canGoForward())

            if (this.homePage) {
                this.shouldEnableZoom = false
            } else {
                if (this.homeCount === 1) {
                    // this.view.webContents.clearHistory()
                    // win.webContents.send('canGoBack', this.view.webContents.canGoBack())
                }
                this.shouldEnableZoom = true
            }

            this.homeCount += 1
            if (this.homeCount > 0) {
                this.homePage = false
            }
        })

        this.view.webContents.once('did-finish-load', () => {
            ipcMain.emit('loadedView')
        })

        // this.view.webContents.on('did-navigate', () => {
        //     if (!this.view.webContents.canGoBack()) {
        //         this.homePage = true
        //     }
        // })

        const doneLoading = () => {
            if (this.shouldEnableZoom) {
                this.view.webContents.setVisualZoomLevelLimits(1, 3)
            } else {
                this.view.webContents.setVisualZoomLevelLimits(1, 1)
            }
            if (this.view.webContents.getURL() === 'file://' + path.join(__dirname, "../pages/favorites.html")) {
                this.view.webContents.setVisualZoomLevelLimits(1, 1)
            }
            win.webContents.send('finishedLoading')
        }
        
        this.view.webContents.on('did-finish-load', doneLoading)

        this.view.webContents.on('did-stop-loading', doneLoading)
        
        this.view.webContents.on('did-start-loading', () => {
            win.webContents.send('startedLoading')
        })

        this.view.webContents.on('did-fail-load', (_ev: Event, code: number, desc: string, url: string) => {
            doneLoading()
            LoadingError(code, desc, url, () => {
                // pass
            })
        })

        ipcMain.on('goBack', () => {
            this.view.webContents.goBack()
            this.view.webContents.focus()
        })

        ipcMain.on('goForward', () => {
            this.view.webContents.goForward()
            this.view.webContents.focus()
        })

        ipcMain.on('refreshPage', () => {
            if (this.view.webContents.isLoading()) {
                this.view.webContents.stop()
            } else {
                this.view.webContents.reload()
            }
            this.view.webContents.focus()
        })

        ipcMain.on('goHome', () => {
            this.goHome()
        })

        const updateSearchBar = (_ev: Event, url: string) => {
            if (this.homePage) {
                win.webContents.send('setSearchBar', '')
                win.webContents.send('setSearchBarURL', '')
                return
            }
            if (this.view.webContents.getURL() === 'file://' + path.join(__dirname, "../pages/favorites.html")) {
                win.webContents.send('setSearchBar', 'surfer://favorites')
                win.webContents.send('setSearchBarURL', 'surfer://favorites')
                return
            }
            let text: string
            if (typeof url === undefined) {
                return
            }
            if (url.indexOf('https://www.google.com/search?q=') === 0) {
                // text = new URL(url).toString()
                if (url.indexOf('&') === -1) {
                    text = url.substring(32)
                } else {
                    text = url.substring(32, url.indexOf('&'))
                }
                text = decodeURIComponent(text)
                text = text.replaceAll('+', ' ')
            } else if (url.indexOf('https://') === 0 || url.indexOf('http://') === 0) {
                text = url.replaceAll('https://', '').replaceAll('http://', '').replaceAll('www.', '')
                text = text.substring(0, text.indexOf('/'))
            } else {
                text = url
            }
            win.webContents.send('setSearchBar', text)
            win.webContents.send('setSearchBarURL', url)
        }

        ipcMain.on('searchBarQueryEntered', (_event, query) => {
            if (query.length === 0) {
                return
            }
            const localhostRegex = /^localhost:\d+$/
            const httpHttpsRegex = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)/
            // const anyProtocolRegex = /[a-z]+:\/\/[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)/
            if (localhostRegex.test(query)) {
                this.view.webContents.loadURL('http://' + query)
                console.log('localhost')
            // } else if (query.indexOf('https://') === 0 || query.indexOf('http://') === 0) {
            } else if (httpHttpsRegex.test(query)) {
                this.view.webContents.loadURL(query)
            } else if (query.includes('://')) {
            // } else if (anyProtocolRegex.test(query)) {
                this.view.webContents.loadURL(query)
            } else if (query.includes('/') || query.includes('.')) {
                this.view.webContents.loadURL('http://' + query)
            } else {
                this.view.webContents.loadURL(`https://google.com/search?q=${query}`)
            }
            this.view.webContents.focus()
        })
    }

    goHome(): void {
        // this.view.webContents.loadFile(path.join(__dirname, "../pages/favorites.html"))
        this.view.webContents.loadURL('https://google.com/')
        this.homeCount = 0
        this.homePage = true
        this.view.webContents.focus()
    }
}