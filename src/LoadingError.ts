
export function LoadingError(code: number, desc: string, url: string, displayError: (code: number, desc: string) => void): void {
    console.log('Failed loading the page, with the code:')
    console.log(code)
    console.log('Description:')
    console.log(desc)
    console.log('Failed URL:')
    console.log(url)
    console.log('')

    switch (code) {
        case -3:
            
            break
        
        case -106:
            displayError(code, desc)
            break
    
        default:
            break
    }
}