const backButton = <HTMLButtonElement>document.getElementById('backButton')
const forwardButton = <HTMLButtonElement>document.getElementById('forwardButton')
const refreshButton = <HTMLButtonElement>document.getElementById('refreshButton')
const settingsButton = <HTMLButtonElement>document.getElementById('settingsButton')
const searchBar = <HTMLInputElement>document.getElementById('searchBar')
const progressBar = document.getElementById('progressBar')
const titleBar = document.getElementById('titleBar')
const nonDoubleClickableElements = document.querySelectorAll('.barButton, #searchBar')

const tabBar = document.getElementById('tabBar')
const spacingBar = document.getElementById('spacingBar')

document.documentElement.setAttribute('data-theme', 'light')
// document.documentElement.setAttribute('data-theme', 'dark')

window.api.handleSetTheme((_ev: Event, theme: 'dark' | 'light') => {
    document.documentElement.setAttribute('data-theme', theme)
})


window.api.handleStartedLoading(() => {
    progressBar.style.backgroundColor = 'var(--loading-color)'
    refreshButton.style.paddingTop = '2px'
    refreshButton.innerHTML = '&#10005'
})

window.api.handleFinishedLoading(() => {
    progressBar.style.backgroundColor = 'var(--primary-color)'
    refreshButton.style.paddingTop = '1px'
    refreshButton.innerHTML = '&#10227'
})

window.api.handleRemoveLeftMargin(() => {
    backButton.style.marginLeft = '5px'
})

window.api.handleRestoreLeftMargin(() => {
    backButton.style.marginLeft = '75px'
})

backButton.addEventListener('click', () => {
    window.api.backButtonPressed()
})

forwardButton.addEventListener('click', () => {
    window.api.forwardButtonPressed()
})

refreshButton.addEventListener('click', () => {
    window.api.refreshButtonPressed()
})

settingsButton.addEventListener('mousedown', () => {
    window.api.toggleSettings()
})

window.api.handleCanGoBack((_ev: Event, canGoBack: boolean) => {
    backButton.disabled = !canGoBack
})

window.api.handleCanGoForward((_ev: Event, canGoForward: boolean) => {
    forwardButton.disabled = !canGoForward
})

searchBar.addEventListener('keyup' , (event: KeyboardEvent) => {
    //key code for enter
    if (event.key === 'Enter') {
        window.api.searchBarQueryEntered(searchBar.value)
        event.preventDefault()
        searchBar.blur()
    }
})

window.api.handleWindowFocusedOrBlurred(() => {
    searchBar.blur()
})

let searchBarFocused = searchBar === document.activeElement
searchBar.addEventListener('focus', () => {
    searchBarFocused = true
    searchBar.value = searchBarURL
    searchBar.select()
    setTimeout(() => searchBar.select(), 30)
    // searchBar.setSelectionRange(0, searchBar.value.length)
    searchBar.style.background = "var(--background-color)"
})

searchBar.addEventListener('blur', () => {
    searchBarFocused = false
    searchBar.value = searchBarText
    searchBar.style.background = "var(--primary-color)"
})

let searchBarText = ''
let searchBarURL = ''
window.api.handleSetSearchBar((_ev: Event, text: string) => {
    searchBarText = text
    if (!searchBarFocused) {
        searchBar.value = text
    }
})

window.api.handleSetSearchBarURL((_ev: Event, url: string) => {
    searchBarURL = url
    if (searchBarFocused) {
        searchBar.value = url
    }
})

let canDoubleClickTitleBar = true

nonDoubleClickableElements.forEach(elm => {
    elm.addEventListener('mouseenter', () => {
        canDoubleClickTitleBar = false
    })
    elm.addEventListener('mouseout', () => {
        canDoubleClickTitleBar = true
    })
})

titleBar.addEventListener('dblclick', () => {
    if (canDoubleClickTitleBar) window.api.titleBarDoubleClicked()
})


window.api.handleLockButtonPressed((_ev: Event, isOn: boolean) => {
    if (isOn) {
        tabBar.style.visibility = 'hidden'
        spacingBar.style.visibility = 'hidden'
    } else {
        tabBar.style.visibility = 'visible'
        spacingBar.style.visibility = 'visible'
    }
})