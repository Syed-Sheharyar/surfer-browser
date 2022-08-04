const themeToggle = document.getElementById('themeToggle')
const themeToggleRow = document.getElementById('themeToggleRow')
const optionsList = document.getElementById('optionsList')

const onToggleClick = () => {
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
// themeToggle.addEventListener('click', onToggleClick)
themeToggleRow.addEventListener('click', onToggleClick)

window.api.onSetTheme((_ev: Event, theme: 'dark' | 'light') => {
    document.documentElement.setAttribute('data-theme', theme)
    themeToggleState = theme === 'dark' ? true : false
    if (themeToggleState) {
        themeToggle.className = 'rowItem checkbox checked'
        themeToggle.innerHTML = '&#10004'
    }
})

window.api.onShow(() => {
    optionsList.style.visibility = 'visible'
})

window.api.onHide(() => {
    optionsList.style.visibility = 'hidden'
})