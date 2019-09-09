import dotenv from "dotenv"
dotenv.config()
import "reflect-metadata"
import express from "express"
import cookieParser from "cookie-parser"
import morgan from "morgan"
import http from "http"

const app = express()

export let domain = ""
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

export let server = http.createServer(app)
import { wss } from "./wsserver"
wss

import { router } from "./routes"
app.use("/", router)

// start express server
server.listen(process.env.PORT, () => console.log(`listening on port ${process.env.PORT}`))

