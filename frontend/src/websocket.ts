export let ws: WebSocket | null = null

import store from "./store/store" 
import config from "./config"

let clientClosed = false
let time = 1000

export function connect() {
    ws = new WebSocket(config.wsUrl)
    ws.onopen = () => {
        time = 1000
    }
    ws.onmessage = (message) => {
        let msg = JSON.parse(message.data)
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