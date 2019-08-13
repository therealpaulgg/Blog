import dotenv from "dotenv"
dotenv.config()
import "reflect-metadata"
import routes from "./routes"
import express from "express"
import cookieParser from "cookie-parser"
import morgan from "morgan"

const app = express()

let domain = ""
if (process.env.ENVIRONMENT === "development") {
    domain = "http://localhost:8080"
} else if (process.env.ENVIRONMENT === "staging") {
    domain = "https://test.blog.paulgellai.dev"
} else if (process.env.ENVIRONMENT === "prod") {
    domain = "https://blog.paulgellai.dev"
}

app.use(function (req, res, next) {
    // very important so our cookies don't get stolen
    res.header("Access-Control-Allow-Origin", domain)
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept")
    res.header("Access-Control-Allow-Credentials", "true")
    next()
})

app.use(morgan("combined"))
app.use(express.json())
app.use(cookieParser())
app.use("/", routes)

// start express server
app.listen(3000, () => console.log("listening on port 3000"))