import "reflect-metadata";
import {createConnection, Connection} from "typeorm";
import * as bodyParser from "body-parser";
import {Request, Response} from "express";
import routes from "./routes";
import {Post} from "./entity/Post";
import express from "express"
import cookieParser from "cookie-parser";


createConnection()
// createConnection().then(async connection => {

    

//     // // insert new users for test
//     // await connection.manager.save(connection.manager.create(Post, {
//     //     title: "My Title",
//     //     content: "my blog content"
//     // }));

// }).catch(error => console.log(error));

// create express app
const app = express();

app.use(function (req, res, next) {
    // very important so our cookies don't get stolen
    res.header("Access-Control-Allow-Origin", "http://localhost:8080");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.header("Access-Control-Allow-Credentials", "true")
    next();
});

app.use(express.json())
app.use(cookieParser())

app.use("/", routes)

// start express server
app.listen(3000, () => console.log("listening on port 3000"));