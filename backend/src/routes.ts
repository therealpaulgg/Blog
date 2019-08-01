import express from "express"
import md from "./mdparser"
import { getConnection } from "typeorm";
import jwt from "jsonwebtoken";
import argon2 from "argon2"
import { Post } from "./entity/Post";
import { User } from "./entity/User";

// let repo = getRepository(Post)

let router = express.Router()

router.get("/", (req, res) => res.send("Hello world"))

router.get("/test", (req, res) => {
    res.json({
        title: "Its a freakin blog post",
        content: md.render('# hello everyone\n This is my blog post. Here are some sample cool renders below.\n #### Sample Cool Renders\n```python\nprint(\"hello world!\")\n```\n$\\int_0^5{\\frac{x}{y}}=\\infty$')
    })
})

router.post("/what", (req, res) => {
    md.render(req.body.input)
    res.send("done")
})

router.get("/jwt", (req, res) => {
    let token = jwt.sign({ username: "test" }, "VERYSECRETKEY", { expiresIn: 60 * 30 })
    res.header("Set-Cookie", `auth=${token}`)
    res.send(token)
})

router.post("/jwt-verify", (req, res) => {
    try {
        res.send(jwt.verify(req.body.token, "VERYSECRETKEY"))
    } catch (__) {
        res.status(401).send("Invalid token.")
    }
})

router.get("/posts", (req, res) => {
    getConnection().manager.find(Post, {relations: ["user"]}).then(result => {
        // let posts = []
        // for (let post of result) {
        //     let obj = post as any
        //     obj["username"] = post.user.username
        //     posts.push(obj)
        // }
        res.send(result)
    })
})

router.get("/post/:url_title", (req, res) => {
    getConnection().manager.findOne(Post, { url_title: req.params.url_title }).then(result => {
        let data = result
        data.content = md.render(data.content)
        res.send(data)
    }).catch(err => res.send({ title: "Oof!", content: "No post found. :(" }))
})

router.post("/newpost", checkAuth, async (req, res) => {
    let connection = getConnection()
    let title: string = req.body.title
    let post = new Post()
    post.title = title
    post.content = req.body.content
    post.url_title = title.replace(/\W+/g, '-').toLowerCase()
    let user = await connection.manager.findOne(User, {username: res.locals.user})
    post.user = user
    await connection.manager.save(user)
    await connection.manager.save(post).then(() => res.send("posted"))
    user.addPost(post)
    console.log(user)
    console.log(post)
    // getConnection().manager.save(Post, {
    //     title: title,
    //     content: req.body.content,
    //     url_title: title.replace(/\W+/g, '-').toLowerCase()
    // }).then(() => res.send("posted"))
})

// TODO: password requirements
router.post("/register", async (req, res) => {
    getConnection().manager.save(User, {
        username: req.body.username as string,
        email: req.body.email as string,
        password_hash: await argon2.hash(req.body.password) as string
    }).then(() => res.send("registered"))
})

router.post("/delete", checkAuth, (req, res) => {
    getConnection().manager.delete(Post, { url_title: req.body.url_title }).then(() => {
        res.send("post deleted")
    }).catch(() => {
        res.status(404).send("post does not exist")
    })
})

router.post("/login", (req, res) => {
    getConnection().manager.findOne(User, { username: req.body.username }).then(async result => {
        if (await argon2.verify(result.password_hash, req.body.password)) {
            let token = jwt.sign({ username: req.body.username }, "VERYSECRETKEY", { expiresIn: 60 * 30 })
            res.header("Set-Cookie", `auth=${token}`)
            res.send("Success")
        } else {
            res.status(401).send("Unauthorized")
        }
    }).catch(() => res.status(401).send("User not found in our system."))
})

function checkAuth(req, res, next) {
    try {
        let token: any = jwt.verify(req.cookies["auth"], "VERYSECRETKEY")
        res.locals.user = token.username
        next()
    } catch (__) {
        res.status(401).send("Unauthorized")
    }
}

export = router 