const themeToggle = document.getElementById('themeToggle')

let themeToggleState = false
themeToggle.addEventListener('click', () => {
    themeToggleState = !themeToggleState
    window.api.toggleTheme(themeToggleState ? 'dark' : 'light')
    if (themeToggleState) {
        themeToggle.className = 'rowItem checkbox checked'
        // themeToggle.innerHTML = '&#10003'
        themeToggle.innerHTML = '&#10004'
    } else {
        themeToggle.className = 'rowItem checkbox'
        themeToggle.innerText = ''
    }
})

window.api.onSetTheme((_ev: Event, theme: 'dark' | 'light') => {
    document.documentElement.setAttribute('data-theme', theme)
    themeToggleState = theme === 'dark' ? true : false
    if (themeToggleState) {
        themeToggle.className = 'rowItem checkbox checked'
        themeToggle.innerHTML = '&#10004'
    }
})