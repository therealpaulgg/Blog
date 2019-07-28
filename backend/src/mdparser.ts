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

export = md