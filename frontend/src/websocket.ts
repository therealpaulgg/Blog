export let ws: WebSocket | null = null

let clientClosed = false
let time = 1000

export function connect() {
    ws = new WebSocket("ws://localhost:3000")
    ws.onopen = () => {
        time = 1000
    }
    ws.onmessage = (thing) => console.log(thing)
    ws.onclose = () => {
        if (clientClosed === false) {
            setTimeout(connect, time)
            time *= 2
        }
        clientClosed = false
    }
}

export function close() {
    clientClosed = true
    ws.close()
}