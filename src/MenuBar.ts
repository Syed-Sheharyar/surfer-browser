import { Menu, MenuItem, ipcMain } from "electron"

export class MenuBar {
    menu: Menu
    constructor() {

        this.menu = new Menu()

        // const appMenu = new Menu()

        // appMenu.append(new MenuItem({ label: 'About Surfer', role: 'about' }))
        
        // appMenu.append(new MenuItem({ type: 'separator' }))
        
        // appMenu.append(new MenuItem({ label: 'Services', role: 'services' }))
        
        // appMenu.append(new MenuItem({ type: 'separator' }))
        
        // appMenu.append(new MenuItem({ label: 'Hide Surfer', role: 'hide', accelerator: 'CmdOrCtrl+H' }))
        
        // appMenu.append(new MenuItem({ label: 'Hide Others', role: 'hideOthers', accelerator: 'Alt+CmdOrCtrl+H' }))
        
        // appMenu.append(new MenuItem({ type: 'separator' }))
        
        // appMenu.append(new MenuItem({ label: 'Quit Surfer', role: 'quit', accelerator: 'CmdOrCtrl+Q' }))
        
        
        const fileMenu = new Menu()
        
        fileMenu.append(new MenuItem({ label: 'New Tab', accelerator: 'CmdOrCtrl+T' }))
        
        fileMenu.append(new MenuItem({ label: 'Duplicate Tab', accelerator: 'CmdOrCtrl+D' }))

        fileMenu.append(new MenuItem({ label: 'New Window', accelerator: 'CmdOrCtrl+N' }))

        fileMenu.append(new MenuItem({ label: 'Re-open Closed Tab', accelerator: 'Shift+CmdOrCtrl+T' }))

        fileMenu.append(new MenuItem({ label: 'Open File', accelerator: 'CmdOrCtrl+O' }))
        
        fileMenu.append(new MenuItem({ type: 'separator' }))

        fileMenu.append(new MenuItem({ label: 'Close Window', accelerator: 'Shift+CmdOrCtrl+W' }))
        
        fileMenu.append(new MenuItem({ label: 'Close Tab', accelerator: 'Shift+CmdOrCtrl+W' }))
        
        fileMenu.append(new MenuItem({ label: 'Save Page As' }))
        
        fileMenu.append(new MenuItem({ type: 'separator' }))
        
        fileMenu.append(new MenuItem({ label: 'Print' }))
        
        const editMenu = new Menu()

        editMenu.append(new MenuItem({ label: 'Undo', role: 'undo', accelerator: 'CmdOrCtrl+Z' }))

        editMenu.append(new MenuItem({ label: 'Redo', role: 'redo', accelerator: 'CmdOrCtrl+Shift+Z' }))
        
        editMenu.append(new MenuItem({ type: 'separator' }))
        
        editMenu.append(new MenuItem({ label: 'Cut', role: 'cut', accelerator: 'CmdOrCtrl+X' }))
        
        editMenu.append(new MenuItem({ label: 'Copy', role: 'copy', accelerator: 'CmdOrCtrl+C' }))
        
        editMenu.append(new MenuItem({ label: 'Paste', role: 'paste', accelerator: 'CmdOrCtrl+V' }))
        
        editMenu.append(new MenuItem({ label: 'Select All',accelerator: 'CmdOrCtrl+A', click: () => ipcMain.emit('selectAll') }))
        
        const viewMenu = new Menu()
        
        viewMenu.append(new MenuItem({ label: 'Reload', accelerator: 'CmdOrCtrl+R', click: () => ipcMain.emit('reload') }))
        
        viewMenu.append(new MenuItem({ label: 'Toggle Developer Tools', accelerator: 'Alt+CmdOrCtrl+I', click: () => ipcMain.emit('toggleDevTools') }))
        
        viewMenu.append(new MenuItem({ type: 'separator' }))
        
        viewMenu.append(new MenuItem({ label: 'Actual Size', accelerator: 'CmdOrCtrl+0', click: () => ipcMain.emit('actualSize') }))
        
        viewMenu.append(new MenuItem({ label: 'Zoom In', accelerator: 'CmdOrCtrl+Plus', click: () => ipcMain.emit('zoomIn') }))
        
        viewMenu.append(new MenuItem({ label: 'Zoom Out', accelerator: 'CmdOrCtrl+-', click: () => ipcMain.emit('zoomOut') }))
        
        const windowMenu = new Menu()


        this.menu.append(new MenuItem({ label: 'Surfer', role: 'appMenu' }))

        this.menu.append(new MenuItem({ label: 'File', role: 'fileMenu', submenu: fileMenu }))

        this.menu.append(new MenuItem({ label: 'Edit', role: 'editMenu', submenu: editMenu }))

        this.menu.append(new MenuItem({ label: 'View', role: 'viewMenu', submenu: viewMenu }))

        this.menu.append(new MenuItem({ label: 'Window', role: 'windowMenu' }))

        Menu.setApplicationMenu(this.menu)
    }
}
