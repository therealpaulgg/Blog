import ws from "ws"
import jwt from "jsonwebtoken"
import { server } from "./app"

export let wss = new ws.Server({ noServer: true })

server.on("upgrade", (request, socket, head) => {
    try {
        if (getVerified(request) != null) {
            wss.handleUpgrade(request, socket, head, (ws) => wss.emit("connection", ws, request))
        } else {
            socket.destroy()
        }
    } catch {
        socket.destroy()
    }
})

function getVerified(request): any {
    try {
        let cookieArr = request.headers.cookie.split("; ")
        let cookies = {}
        for (let i = 0; i < cookieArr.length; i++) {
            let split = cookieArr[i].split("=")
            cookies[split[0]] = split[1]
        }
        // in future, if no cookie with 'auth', check bearer token header
        let authcookie = cookies["auth"]
        return jwt.verify(authcookie, process.env.SECRET_KEY)
    } catch {
        return null
    }
}

function heartbeat() {
    this.isAlive = true
}

interface CustomWs extends ws {
    username: string
    isAlive: boolean
} 

wss.on("connection", (ws: CustomWs, request) => {
    ws.username = getVerified(request).username
    wss.emit("notification", ws)
    ws.on("message", (message) => console.log(`Received message ${message}`))
    ws.on("pong", heartbeat)
    let interval = setInterval(() => {
        if (ws.isAlive === false) {
            clearInterval(interval)
            return ws.terminate()
        }
        ws.isAlive = false
        // console.log(`sending msg to ${getVerified(request).username}`)
        // ws.send("hello")
        ws.ping()
    }, 1000)
})

wss.on("notification", async (ws?: CustomWs, username?) => {
    console.log("attempting")
    let socket: ws
    if (ws == null) {
        console.log("null!")
        let connections = Array.from(wss.clients) as Array<CustomWs>
        socket = connections.find((ele) => {
            return ele ? ele.username === username : false
        })
    } else {
        socket = ws
    }
    // let connection = getConnection()
    // let user = await connection.manager.findOne(User, { username: socket.username })
    // notificationCount: await connection.manager.count(PostNotification, { user })
    if (socket) {
        socket.send(JSON.stringify({
            updateNotifications: true
        }))
    }
})

wss.on("close", () => console.log("Client disconnected."))

export function emit(foo) {
    wss.emit(foo)
}