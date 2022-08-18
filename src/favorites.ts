// const search = <HTMLInputElement>document.getElementById('searchBar')

// window.onload = () => {
//     search.value = ''
// }

// search.addEventListener('keyup', (e: KeyboardEvent) => {
//     if (e.key === 'Enter') {
//             if (search.value.indexOf('https://') === 0 || search.value.indexOf('http://') === 0) {
//                 window.location.href = search.value
//             } else if (search.value.includes('://')) {
//                 window.location.href = search.value
//             } else if (search.value.includes('/') || search.value.includes('.')) {
//                 window.location.href = 'http://' + search.value
//             } else {
//                 window.location.href = `https://google.com/search?q=${search.value}`
//             }
//     }
// })