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
    getConnection().manager.find(Post, { relations: ["user"] }).then(result => {
        let posts = []
        for (let post of result) {
            let obj = {
                urlTitle: post.urlTitle,
                title: post.title,
                content: post.content,
                username: post.user.username
            }
            posts.push(obj)
        }
        console.log(posts)
        res.send(posts)
    })
})

router.get("/post/:urlTitle", (req, res) => {
    getConnection().manager.findOne(Post, { urlTitle: req.params.urlTitle }, { relations: ["user"] }).then(result => {
        let formattedData = {
            urlTitle: result.urlTitle,
            title: result.title,
            content: md.render(result.content),
            username: result.user.username
        }
        res.send(formattedData)
    }).catch(err => res.send({ title: "Oof!", content: "No post found. :(" }))
})

router.post("/newpost", checkAuth, async (req, res) => {
    let connection = getConnection()
    let title: string = req.body.title
    let post = new Post()
    post.title = title
    post.content = req.body.content
    post.urlTitle = title.replace(/\W+/g, '-').toLowerCase()
    let user = await connection.manager.findOne(User, { username: res.locals.user })
    post.user = user
    await connection.manager.save(user)
    await connection.manager.save(post).then(() => res.send("posted"))
    user.addPost(post)
    res.send("Done")
})

router.post("/editpost", checkAuth, async (req, res) => {
    let connection = getConnection()
    let post = await connection.manager.findOne(Post, { urlTitle: req.body.urlTitle })
    if (post.user.username === res.locals.user) {
        let title = req.body.new_title
        post.title = title
        post.content = md.render(req.body.new_content)
        post.urlTitle = title.replace(/\W+/g, '-').toLowerCase()
        await connection.manager.save(post)
        res.send("Done")
    } else {
        res.status(401).send("You are not the owner of this post.")
    }
})

// TODO: password requirements
router.post("/register", async (req, res) => {
    if (req.body.username.length > 30) {
        let connection = await getConnection()
        let user = await connection.manager.findOne(User, {username: req.body.username})
        if (user) {
            connection.manager.save(User, {
                username: req.body.username as string,
                email: req.body.email as string,
                password_hash: await argon2.hash(req.body.password) as string
            }).then(() => res.send("registered"))
        } else {
            res.status(400).send("User with this username already exists.")
        }
    } else {
        res.status(400).send("User with this username already exists.")
    }
    
})

router.post("/delete", checkAuth, (req, res) => {
    let connection = getConnection()
    connection.manager.findOne(Post, { urlTitle: req.body.urlTitle }, {relations: ["user"]}).then((post) => {
        if (post.user.username === res.locals.user) {
            connection.manager.remove(post)
            res.send("Done")
        } else {
            res.send("You are not the owner of this post.")
        }
    }).catch(() => res.status(404).send("Post does not exist."))
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