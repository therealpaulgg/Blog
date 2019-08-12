import "reflect-metadata";
import routes from "./routes";
import express from "express"
import cookieParser from "cookie-parser";
import morgan from "morgan";
import dotenv from "dotenv";

dotenv.config()

const app = express();

app.use(function (req, res, next) {
    // very important so our cookies don't get stolen
    res.header("Access-Control-Allow-Origin", "http://localhost:8080");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.header("Access-Control-Allow-Credentials", "true")
    next();
});

app.use(morgan("combined"));
app.use(express.json())
app.use(cookieParser())
app.use("/", routes)

// start express server
app.listen(3000, () => console.log("listening on port 3000"));