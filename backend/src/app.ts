import dotenv from "dotenv"
dotenv.config()
import "reflect-metadata"
import { router } from "./routes"
import express from "express"
import cookieParser from "cookie-parser"
import morgan from "morgan"
import ws from "ws"
import http from "http"
import jwt from "jsonwebtoken"

const app = express()

let domain = ""
if (process.env.ENVIRONMENT === "development") {
    domain = "http://localhost:8080"
} else if (process.env.ENVIRONMENT === "staging") {
    domain = "https://test.blog.paulgellai.dev"
} else if (process.env.ENVIRONMENT === "prod") {
    domain = "https://blog.paulgellai.dev"
}

app.use((req, res, next) => {
    // very important so our cookies don't get stolen
    res.header("Access-Control-Allow-Origin", domain)
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept")
    res.header("Access-Control-Allow-Credentials", "true")
    next()
})

app.use(morgan("combined"))
app.use(express.json())
app.use(cookieParser())
app.use("/", router)

let server = http.createServer(app)
let wss = new ws.Server({ noServer: true })

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

wss.on("connection", (ws, request) => {
    ws.on("message", (message) => console.log(`Received message ${message}`))
    ws.on("pong", heartbeat)
    let interval = setInterval(() => {
        if (ws.isAlive === false) {
            console.log("killing connection")
            clearInterval(interval)
            return ws.terminate()
        }
        ws.isAlive = false
        // console.log(`sending msg to ${getVerified(request).username}`)
        // ws.send("hello")
        ws.ping()
    }, 1000)
})

wss.on("close", () => console.log("Client disconnected."))

// start express server
server.listen(process.env.PORT, () => console.log(`listening on port ${process.env.PORT}`))

