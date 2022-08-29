import { BrowserView, BrowserWindow, ipcMain, dialog, MenuItem, Menu } from "electron"
import * as path from "path"
import { LoadingError } from "./LoadingError"

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
        
        ipcMain.on('lockButtonPressed', (_ev: Event, isOn: boolean) => {
            const bounds = win.getBounds()
            if (isOn) {
                this.view.setBounds({ x: 0, y: 37, width: bounds.width, height: bounds.height - 37 })
            } else {
                this.view.setBounds({ x: 0, y: tabHeight, width: bounds.width, height: bounds.height - tabHeight })
            }
        })

        // this.view.webContents.openDevTools()

        this.goHome()

        this.view.webContents.on('focus', () => {
            ipcMain.emit('closeSettings')
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

        // Contextmenu test

        // ipcMain.on('contextmenu', () => {
        //     const menu = new Menu()
            
        //     const separator = new MenuItem({type: 'separator'})
        
        //     const gobackitem = new MenuItem({label: 'Go Back', enabled: this.view.webContents.canGoBack(), click: () => this.view.webContents.goBack()})
        //     menu.append(gobackitem)
        
        //     const goforwarditem = new MenuItem({label: 'Go Forward', enabled: this.view.webContents.canGoForward(), click: () => this.view.webContents.goForward()})
        //     menu.append(goforwarditem)

        //     const reloaditem = new MenuItem({label: 'Reload', click: () => this.view.webContents.reload()})
        //     menu.append(reloaditem)
            
        //     menu.append(separator)

        //     const cutitem = new MenuItem({label: 'Cut', role: 'cut'})
        //     menu.append(cutitem)
            
        //     const copyitem = new MenuItem({label: 'Copy', role: 'copy'})
        //     menu.append(copyitem)

        //     const pasteitem = new MenuItem({label: 'Paste', role: 'paste'})
        //     menu.append(pasteitem)

        //     menu.append(separator)

        //     const undoitem = new MenuItem({label: 'Undo', role: 'undo'})
        //     menu.append(undoitem)

        //     const redoitem = new MenuItem({label: 'Redo', role: 'redo'})
        //     menu.append(redoitem)

        //     menu.popup()
        // })

        // ipcMain.on('contextmenuLink', () => {
        //     // Open in New Tab
        //     // Save Link as
        //     // separator
        //     // Search with Google
        //     // separator
        //     // Copy
        //     // Copy Link
        //     // separator
        //     // Go Back
        //     // Go Forward
        //     // separator
        //     // Inspect Element

        //     const menu = new Menu()
            
        //     const separator = new MenuItem({type: 'separator'})
        
        //     const openInNewTabItem = new MenuItem({label: 'openInNewTabItem'})
        //     menu.append(openInNewTabItem)
        
        //     const goforwarditem = new MenuItem({label: 'Go Forward', enabled: this.view.webContents.canGoForward(), click: () => this.view.webContents.goForward()})
        //     menu.append(goforwarditem)

        //     const reloaditem = new MenuItem({label: 'Reload', click: () => this.view.webContents.reload()})
        //     menu.append(reloaditem)
            
        //     menu.append(separator)

        //     const cutitem = new MenuItem({label: 'Cut', role: 'cut'})
        //     menu.append(cutitem)
            
        //     const copyitem = new MenuItem({label: 'Copy', role: 'copy'})
        //     menu.append(copyitem)

        //     const pasteitem = new MenuItem({label: 'Paste', role: 'paste'})
        //     menu.append(pasteitem)

        //     menu.append(separator)

        //     const undoitem = new MenuItem({label: 'Undo', role: 'undo'})
        //     menu.append(undoitem)

        //     const redoitem = new MenuItem({label: 'Redo', role: 'redo'})
        //     menu.append(redoitem)

        //     menu.popup()
        // })
        
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

            // win.webContents.send('canRefresh', this.homePage)

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

        this.view.webContents.on('did-finish-load', () => {
            // this.homeCount += 1
            // if (this.homeCount > 0) {
            //     this.homePage = false
            // }
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