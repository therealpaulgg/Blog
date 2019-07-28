import express from "express"
import md from "./mdparser"
import { getRepository, createConnection, getConnection } from "typeorm";
import { Post } from "./entity/Post";

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

router.get("/posts", (req, res) => {
    getConnection().manager.find(Post).then(result => res.send(result))
})

router.get("/post/:url_title", (req, res) => {
    getConnection().manager.findOne(Post, { url_title: req.params.url_title }).then(result => {
        let data = result
        data.content = md.render(data.content)
        res.send(data)
    }).catch(err => res.send({title: "Oof!", content: "No post found. :("}))
})

router.post("/newpost", (req, res) => {
    console.log(req.body)
    let title: string = req.body.title
    getConnection().manager.save(Post, {
        title: title,
        content: req.body.content,
        url_title: title.replace(/\W+/g, '-').toLowerCase()
    }).then(() => res.send("posted"))
})

export = router 