// TODO: Add a contextmenu

import { ipcRenderer } from "electron"

window.addEventListener('contextmenu', (event: MouseEvent) => {
    const elTag = (<HTMLElement>event.target).tagName
    if (elTag === 'IMG') {
        console.log('image')
        ipcRenderer.send('contextmenuImg')
    } else if (elTag === 'A') {
        console.log('link')
        ipcRenderer.send('contextmenuLink')
    } else {
        setTimeout(() => {
            console.log('Selection:')
            console.log(window.getSelection().toString())
            if (window.getSelection().toString().match(/\s*/)) {
                ipcRenderer.send('contextmenu')
            } else {
                ipcRenderer.send('contextmenuText')
            }
        }, 10)
    }
})