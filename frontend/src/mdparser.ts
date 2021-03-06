import markdownit from "markdown-it"
import Prism from "prismjs/components/prism-core"
// Yes. I know this is jank. It's the only way to get this to work with webpack on Windows.
// These files had to be loaded in a certain order to handle dependencies.
// The babel plugin just refused to work on windows. Idk why.
import "prismjs/components/prism-abap"
import "prismjs/components/prism-abnf"
import "prismjs/components/prism-clike"
import "prismjs/components/prism-javascript"
import "prismjs/components/prism-actionscript"
import "prismjs/components/prism-ada"
import "prismjs/components/prism-apacheconf"
import "prismjs/components/prism-apl"
import "prismjs/components/prism-applescript"
import "prismjs/components/prism-c"
import "prismjs/components/prism-cpp"
import "prismjs/components/prism-arduino"
import "prismjs/components/prism-arff"
import "prismjs/components/prism-asciidoc"
import "prismjs/components/prism-asm6502"
import "prismjs/components/prism-csharp"
import "prismjs/components/prism-markup"
import "prismjs/components/prism-aspnet"
import "prismjs/components/prism-autohotkey"
import "prismjs/components/prism-autoit"
import "prismjs/components/prism-bash"
import "prismjs/components/prism-basic"
import "prismjs/components/prism-batch"
import "prismjs/components/prism-bison"
import "prismjs/components/prism-bnf"
import "prismjs/components/prism-brainfuck"
import "prismjs/components/prism-bro"
import "prismjs/components/prism-cil"
import "prismjs/components/prism-clojure"
import "prismjs/components/prism-cmake"
import "prismjs/components/prism-coffeescript"
import "prismjs/components/prism-core"
import "prismjs/components/prism-ruby"
import "prismjs/components/prism-crystal"
import "prismjs/components/prism-csp"
import "prismjs/components/prism-css"
import "prismjs/components/prism-d"
import "prismjs/components/prism-dart"
import "prismjs/components/prism-diff"
import "prismjs/components/prism-dns-zone-file"
import "prismjs/components/prism-docker"
import "prismjs/components/prism-ebnf"
import "prismjs/components/prism-eiffel"
import "prismjs/components/prism-ejs"
import "prismjs/components/prism-elixir"
import "prismjs/components/prism-elm"
import "prismjs/components/prism-erb"
import "prismjs/components/prism-erlang"
import "prismjs/components/prism-flow"
import "prismjs/components/prism-fortran"
import "prismjs/components/prism-fsharp"
import "prismjs/components/prism-gcode"
import "prismjs/components/prism-gedcom"
import "prismjs/components/prism-gherkin"
import "prismjs/components/prism-git"
import "prismjs/components/prism-glsl"
import "prismjs/components/prism-gml"
import "prismjs/components/prism-go"
import "prismjs/components/prism-graphql"
import "prismjs/components/prism-groovy"
import "prismjs/components/prism-haml"
import "prismjs/components/prism-handlebars"
import "prismjs/components/prism-haskell"
import "prismjs/components/prism-haxe"
import "prismjs/components/prism-hcl"
import "prismjs/components/prism-hpkp"
import "prismjs/components/prism-hsts"
import "prismjs/components/prism-http"
import "prismjs/components/prism-ichigojam"
import "prismjs/components/prism-icon"
import "prismjs/components/prism-inform7"
import "prismjs/components/prism-ini"
import "prismjs/components/prism-io"
import "prismjs/components/prism-j"
import "prismjs/components/prism-java"
import "prismjs/components/prism-javadoclike"
import "prismjs/components/prism-javadoc"
import "prismjs/components/prism-javastacktrace"
import "prismjs/components/prism-jolie"
import "prismjs/components/prism-jq"
import "prismjs/components/prism-js-extras"
import "prismjs/components/prism-js-templates"
import "prismjs/components/prism-jsdoc"
import "prismjs/components/prism-json"
import "prismjs/components/prism-json5"
import "prismjs/components/prism-jsonp"
import "prismjs/components/prism-jsx"
import "prismjs/components/prism-julia"
import "prismjs/components/prism-keyman"
import "prismjs/components/prism-kotlin"
import "prismjs/components/prism-latex"
import "prismjs/components/prism-less"
import "prismjs/components/prism-lilypond"
import "prismjs/components/prism-liquid"
import "prismjs/components/prism-lisp"
import "prismjs/components/prism-livescript"
import "prismjs/components/prism-lolcode"
import "prismjs/components/prism-lua"
import "prismjs/components/prism-makefile"
import "prismjs/components/prism-markdown"
import "prismjs/components/prism-markup-templating"
import "prismjs/components/prism-django"
import "prismjs/components/prism-matlab"
import "prismjs/components/prism-mel"
import "prismjs/components/prism-mizar"
import "prismjs/components/prism-monkey"
import "prismjs/components/prism-n1ql"
import "prismjs/components/prism-n4js"
import "prismjs/components/prism-nand2tetris-hdl"
import "prismjs/components/prism-nasm"
import "prismjs/components/prism-nginx"
import "prismjs/components/prism-nim"
import "prismjs/components/prism-nix"
import "prismjs/components/prism-nsis"
import "prismjs/components/prism-objectivec"
import "prismjs/components/prism-ocaml"
import "prismjs/components/prism-opencl"
import "prismjs/components/prism-oz"
import "prismjs/components/prism-parigp"
import "prismjs/components/prism-parser"
import "prismjs/components/prism-pascal"
import "prismjs/components/prism-pascaligo"
import "prismjs/components/prism-pcaxis"
import "prismjs/components/prism-perl"
import "prismjs/components/prism-php-extras"
import "prismjs/components/prism-php"
import "prismjs/components/prism-phpdoc"
import "prismjs/components/prism-sql"
import "prismjs/components/prism-plsql"
import "prismjs/components/prism-powershell"
import "prismjs/components/prism-processing"
import "prismjs/components/prism-prolog"
import "prismjs/components/prism-properties"
import "prismjs/components/prism-protobuf"
import "prismjs/components/prism-pug"
import "prismjs/components/prism-puppet"
import "prismjs/components/prism-pure"
import "prismjs/components/prism-python"
import "prismjs/components/prism-q"
import "prismjs/components/prism-qore"
import "prismjs/components/prism-r"
import "prismjs/components/prism-reason"
import "prismjs/components/prism-regex"
import "prismjs/components/prism-renpy"
import "prismjs/components/prism-rest"
import "prismjs/components/prism-rip"
import "prismjs/components/prism-roboconf"
import "prismjs/components/prism-rust"
import "prismjs/components/prism-sas"
import "prismjs/components/prism-sass"
import "prismjs/components/prism-scala"
import "prismjs/components/prism-scheme"
import "prismjs/components/prism-scss"
import "prismjs/components/prism-shell-session"
import "prismjs/components/prism-smalltalk"
import "prismjs/components/prism-smarty"
import "prismjs/components/prism-soy"
import "prismjs/components/prism-splunk-spl"
import "prismjs/components/prism-stylus"
import "prismjs/components/prism-swift"
import "prismjs/components/prism-t4-templating"
import "prismjs/components/prism-t4-cs"
import "prismjs/components/prism-t4-vb"
import "prismjs/components/prism-tap"
import "prismjs/components/prism-tcl"
import "prismjs/components/prism-textile"
import "prismjs/components/prism-toml"
import "prismjs/components/prism-tsx"
import "prismjs/components/prism-tt2"
import "prismjs/components/prism-twig"
import "prismjs/components/prism-typescript"
import "prismjs/components/prism-vala"
import "prismjs/components/prism-vbnet"
import "prismjs/components/prism-velocity"
import "prismjs/components/prism-verilog"
import "prismjs/components/prism-vhdl"
import "prismjs/components/prism-vim"
import "prismjs/components/prism-visual-basic"
import "prismjs/components/prism-wasm"
import "prismjs/components/prism-wiki"
import "prismjs/components/prism-xeora"
import "prismjs/components/prism-xojo"
import "prismjs/components/prism-xquery"
import "prismjs/components/prism-yaml"
import emoji from "markdown-it-emoji"
import math from "markdown-it-math"
import { renderToString } from "katex"
import twemoji from "twemoji"
import markdownItAttrs from "markdown-it-attrs"
import mentions from "markdown-it-mentions"
import markdown_it_sanitizer from "markdown-it-sanitizer"

function highlightFunction(str, lang) {
    if (lang) {
        const langObject = Prism.languages[lang]
        try {
            return (
                `<pre class="language-${lang}"><code>` +
                Prism.highlight(str, langObject, lang) +
                "</code></pre>"
            )
        } catch (__) {
            // pass
        }
    }
    return `<pre class="language-"><code>` + markdownit().utils.escapeHtml(str) + "</code></pre>"
}

const mathSettings = {
    inlineOpen: "$",
    inlineClose: "$",
    blockOpen: "$$",
    blockClose: "$$",
    inlineRenderer: (str: string) => {
        let output = ""
        try {
            output = renderToString(str.trim())
        } catch (err) {
            output = err.message
        }
        return output
    },
    blockRenderer: (str: string) => {
        let output = ""
        try {
            output = renderToString(str.trim(), { displayMode: true })
        } catch (err) {
            output = err.message
        }
        return output
    }
}

const attributeSettings = {
    leftDelimiter: "{",
    rightDelimiter: "}",
    allowedAttributes: ["id", "class", "style", /^regex.*$/]
}

const mentionParsing = {
    parseURL: (username) => `/profile/${username}`,
    external: true
}

export let mdHtml: markdownit = markdownit({
    highlight: highlightFunction,
    html: true
})
mdHtml.use(math, mathSettings)
mdHtml.use(emoji)
mdHtml.use(markdownItAttrs, attributeSettings)
mdHtml.renderer.rules.emoji = (token, idx) => twemoji.parse(token[idx].content)
mdHtml.use(mentions, mentionParsing)
mdHtml.use(markdown_it_sanitizer)

export let mdNoHtml: markdownit = markdownit({
    highlight: highlightFunction,
    html: false
})
mdNoHtml.use(math, mathSettings)
mdNoHtml.use(emoji)
mdNoHtml.use(markdownItAttrs, attributeSettings)
mdNoHtml.renderer.rules.emoji = (token, idx) => twemoji.parse(token[idx].content)
mdNoHtml.use(mentions, mentionParsing)
