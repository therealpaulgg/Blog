import express from "express"
import markdownit from "markdown-it";
import prism from "markdown-it-prism";
import emoji from "markdown-it-emoji";
import math from "markdown-it-math";
import katex from "katex";

let md = markdownit()
md.use(prism)
md.use(math, {
    inlineOpen: "$",
    inlineClose: "$",
    blockOpen: "$$",
    blockClose: "$$",
    inlineRenderer: (str) => {
        let output = ""
        try {
            output = katex.renderToString(str.trim())
        } catch (err) {
            output = err.message
        }
        return output
    },
    blockRenderer: (str) => {
        let output = ""
        try {
            output = katex.renderToString(str.trim(), { displayMode: true })
        } catch (err) {
            output = err.message
        }
        return output
    }
})
md.use(emoji)


const app: express.Application = express()

app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

app.get("/", (req, res) => res.send("Hello world"))

app.get("/test", (req, res) => {
    res.json({
        title: "Its a freakin blog post",
        content: md.render('# hello everyone\n This is my blog post. Here are some sample cool renders below.\n #### Sample Cool Renders\n```python\nprint("hello world!")\n```\n$\\int_0^5{\\frac{x}{y}}=\\infty$')
    })
})

app.listen(3000, () => console.log("Listening on port 3000"))