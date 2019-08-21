export let ws: WebSocket | null = null

import store from "./store/store" 

let clientClosed = false
let time = 1000

export function connect() {
    ws = new WebSocket("ws://localhost:3000")
    ws.onopen = () => {
        time = 1000
    }
    ws.onmessage = (message) => {
        let msg = JSON.parse(message.data)
        console.log("CYKA BLYAT")
        console.log(msg)
        if (msg.updateNotifications === true) {
            store.dispatch("fetchNotifications", 1)
        }
    }
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