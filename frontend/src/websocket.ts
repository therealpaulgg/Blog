export let ws: WebSocket | null = null

import store from "./store/store"

let clientClosed = false
let time = 1000

export function connect() {
    ws = new WebSocket(process.env.VUE_APP_WS_URL)
    ws.onopen = () => {
        time = 1000
    }
    ws.onmessage = (message) => {
        const msg = JSON.parse(message.data)
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
    if (ws != null) {
        ws.close()
    }
}
