import express from "express"
import { getConnection } from "typeorm";
import jwt from "jsonwebtoken";
import argon2 from "argon2"
import { Post } from "./entity/Post";
import { User } from "./entity/User";
import { Comment } from "./entity/Comment";

let router = express.Router()

router.get("/", (req, res) => res.send("Hello world"))

router.get("/posts", (req, res) => {
    getConnection().manager.find(Post, { relations: ["user"] }).then(result => {
        let posts = []
        for (let post of result) {
            let obj = {
                urlTitle: post.urlTitle,
                title: post.title,
                content: post.content,
                username: post.user.username,
                createdAt: post.createdAt,
                updatedAt: post.updatedAt
            }
            posts.push(obj)
        }
        res.send(posts.reverse())
    })
})

router.get("/post/:urlTitle", async (req, res) => {
    getConnection().manager.findOne(Post, { urlTitle: req.params.urlTitle }, { relations: ["user", "comments", "comments.user"] }).then(result => {
        let comments = []
        result.comments.forEach(comment => {
            comments.push({
                content: comment.content,
                user: comment.user.username,
                createdAt: comment.createdAt,
                updatedAt: comment.updatedAt
            })
        })
        let formattedData = {
            urlTitle: result.urlTitle,
            title: result.title,
            content: result.content,
            username: result.user.username,
            createdAt: result.createdAt,
            updatedAt: result.updatedAt,
            comments: comments.reverse()
        }
        res.send(formattedData)
    }).catch(err => res.send({ title: "Oof!", content: "No post found. :(" }))
})

router.post("/comment", checkAuth, async (req, res) => {
    // Data should be sent through body
    let connection = getConnection()
    let post = await connection.manager.findOne(Post, { urlTitle: req.body.urlTitle })
    let user = await connection.manager.findOne(User, { username: res.locals.user })
    if (post && user) {
        let content: string = req.body.content
        if (content != null && content.length > 0) {
            let comment = new Comment()
            comment.post = post
            comment.content = content
            comment.user = user
            await connection.manager.save(comment)
            res.send("done")
        } else {
            res.status(400).send("Must send comment content body")
        }
    } else {
        res.status(404).send("Post not found or user not found.")
    }
})

router.post("/jwt-verify", (req, res) => {
    try {
        res.send(jwt.verify(req.body.token, "VERYSECRETKEY"))
    } catch (__) {
        res.status(401).send("Invalid token.")
    }
})

router.post("/newpost", checkAuth, async (req, res) => {
    let connection = getConnection()
    let title: string = req.body.title
    let content = req.body.content
    if ((title != null && title.length > 0) && (content != null && content.length > 0)) {
        let post = new Post()
        post.title = title
        post.content = content
        post.urlTitle = title.replace(/\W+/g, '-').toLowerCase()
        let user = await connection.manager.findOne(User, { username: res.locals.user })
        post.user = user
        await connection.manager.save(post)
        res.send("Done")
    } else {
        res.status(400).send("Missing title or post content.")
    }
})

router.post("/editpost", checkAuth, async (req, res) => {
    let connection = getConnection()
    try {
        let post = await connection.manager.findOne(Post, { urlTitle: req.body.urlTitle }, { relations: ["user"] })
        if (post.user.username === res.locals.user) {
            let title = req.body.newTitle
            post.title = title
            post.content = req.body.newContent
            post.urlTitle = title.replace(/\W+/g, '-').toLowerCase()
            await connection.manager.save(post)
            res.send("Done")
        } else {
            res.status(401).send("You are not the owner of this post.")
        }
    } catch (err) {
        res.status(400).send("Bad request.")
    }
})

// TODO: password requirements
router.post("/register", async (req, res) => {
    if (req.body.username.length < 30) {
        let connection = await getConnection()
        let user = await connection.manager.findOne(User, { username: req.body.username })
        if (!user) {
            connection.manager.save(User, {
                username: req.body.username as string,
                email: req.body.email as string,
                password_hash: await argon2.hash(req.body.password) as string
            }).then(() => res.send("registered"))
        } else {
            res.status(400).send("User with this username already exists.")
        }
    } else {
        res.status(400).send("Username too long (must be < 30 characters).")
    }
})

router.post("/delete", checkAuth, (req, res) => {
    let connection = getConnection()
    connection.manager.findOne(Post, { urlTitle: req.body.urlTitle }, { relations: ["user", "comments"] }).then(async (post) => {
        if (post.user.username === res.locals.user) {
            await connection.manager.remove(post.comments)
            await connection.manager.remove(post)
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
            let age = 30 * 60 * 1000
            res.cookie("auth", token, { maxAge: age })
            let date = new Date(new Date().getTime() + age).getTime();
            res.cookie("expiration", date, { maxAge: age })
            res.send("Success")
        } else {
            res.status(401).send("Unauthorized")
        }
    }).catch(() => res.status(401).send("User not found in our system."))
})

router.post("/renew-jwt", checkAuth, (req, res) => {
    // shouldn't have to verify the user that is sending, right?
    let token = jwt.sign({ username: res.locals.user }, "VERYSECRETKEY", { expiresIn: 60 * 30 });
    let age = 30 * 60 * 1000;
    res.cookie("auth", token, { maxAge: age });
    let date = new Date(new Date().getTime() + age).getTime();
    res.cookie("expiration", date, { maxAge: age });
    res.send("JWT renewed");
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