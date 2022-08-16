const goHomeButtonRow = document.getElementById('goHomeButtonRow')
const openSettingsButtonRow = document.getElementById('openSettingsButtonRow')
const themeToggle = document.getElementById('themeToggle')
const themeToggleRow = document.getElementById('themeToggleRow')
const lockToggle = document.getElementById('lockToggle')
const lockToggleRow = document.getElementById('lockToggleRow')
const optionsList = document.getElementById('optionsList')

goHomeButtonRow.addEventListener('click', () => {
    window.api.goHome()
})

openSettingsButtonRow.addEventListener('click', () => {
    window.api.openSettings()
})

const onThemeToggleClick = () => {
    themeToggleState = !themeToggleState
    const theme = themeToggleState ? 'dark' : 'light'
    window.api.toggleTheme(theme)
    document.documentElement.setAttribute('data-theme', theme)
    if (themeToggleState) {
        themeToggle.className = 'rowItem checkbox checked'
        // themeToggle.innerHTML = '&#10003'
        themeToggle.innerHTML = '&#10004'
    } else {
        themeToggle.className = 'rowItem checkbox'
        themeToggle.innerText = ''
    }
}

let themeToggleState = false
// themeToggle.addEventListener('click', onThemeToggleClick)
themeToggleRow.addEventListener('click', onThemeToggleClick)

window.api.onSetTheme((_ev: Event, theme: 'dark' | 'light') => {
    document.documentElement.setAttribute('data-theme', theme)
    themeToggleState = theme === 'dark' ? true : false
    if (themeToggleState) {
        themeToggle.className = 'rowItem checkbox checked'
        themeToggle.innerHTML = '&#10004'
    }
})

const onLockToggleClick = () => {
    lockToggleState = !lockToggleState
    window.api.lockButtonPressed(lockToggleState)
    if (lockToggleState) {
        lockToggle.className = 'rowItem checkbox checked'
        // themeToggle.innerHTML = '&#10003'
        lockToggle.innerHTML = '&#10004'
    } else {
        lockToggle.className = 'rowItem checkbox'
        lockToggle.innerText = ''
    }
}

let lockToggleState = false
// lockToggle.addEventListener('click', onLockToggleClick)
lockToggleRow.addEventListener('click', onLockToggleClick)


window.api.onShow(() => {
    optionsList.style.visibility = 'visible'
})

window.api.onHide(() => {
    optionsList.style.visibility = 'hidden'
})
