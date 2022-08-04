import { BrowserView, BrowserWindow, ipcMain, dialog } from "electron"

export class View {
    view: BrowserView
    homePage: boolean
    homeCount: number
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
                webviewTag: false,
                zoomFactor: 1.0,
                navigateOnDragDrop: true,
                scrollBounce: true,
            }
        })
        win.addBrowserView(this.view)
        this.view.setBounds({ x: 0, y: tabHeight, width: width, height: height - tabHeight })
        this.view.setAutoResize({width: true, height: true})
        this.view.webContents.setVisualZoomLevelLimits(1, 3)
        // this.view.webContents.openDevTools()

        this.goHome()
        
        this.view.webContents.on('will-navigate', (ev: Event, url: string) => {
            updateSearchBar(ev, url)
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
        })

        this.view.webContents.on('did-finish-load', () => {
            this.homeCount += 1
            if (this.homeCount > 0) {
                this.homePage = false
            }
        })

        // this.view.webContents.on('did-navigate', () => {
        //     if (!this.view.webContents.canGoBack()) {
        //         this.homePage = true
        //     }
        // })

        const doneLoading = () => {
            this.view.webContents.setVisualZoomLevelLimits(1, 3)
            win.webContents.send('finishedLoading')
        }
        
        this.view.webContents.on('did-finish-load', doneLoading)

        this.view.webContents.on('did-stop-loading', doneLoading)
        
        this.view.webContents.on('did-start-loading', () => {
            win.webContents.send('startedLoading')
        })

        this.view.webContents.on('did-fail-load', () => {
            console.log('failed loading the page!')
            doneLoading()
        })

        ipcMain.on('goBack', () => {
            this.view.webContents.goBack()
        })

        ipcMain.on('goForward', () => {
            this.view.webContents.goForward()
        })

        ipcMain.on('refreshPage', () => {
            this.view.webContents.reload()
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
            if (query.indexOf('https://') === 0 || query.indexOf('http://') === 0) {
                this.view.webContents.loadURL(query)
            } else if (query.includes('.') || query.includes('/')) {
                this.view.webContents.loadURL('http://' + query)
            } else {
                this.view.webContents.loadURL(`https://google.com/search?q=${query}`)
            }
        })
    }

    goHome(): void {
        // this.view.webContents.loadFile(path.join(__dirname, "../pages/favorites.html"))
        this.view.webContents.loadURL('https://google.com/')
        this.homeCount = 0
        this.homePage = true
    }
}