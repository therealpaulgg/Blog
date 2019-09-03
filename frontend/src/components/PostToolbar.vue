<template>
    <div class="toolbar">
        <font-awesome-icon
            class="icon"
            style="position: relative"
            icon="link"
            @click="toggle(0)"
            ref="linkbtn"
        ></font-awesome-icon>
        <font-awesome-icon class="icon" icon="code" ref="codebtn" @click="toggle(2)"></font-awesome-icon>

        <div
            class="popup"
            v-if="popups[2]"
            v-closable="{
                        exclude: refs,
                        handler: 'closeAll'
                    }"
        >
            <p>Language</p>
            <input type="text" class="infield" v-model="language" />
            <br />
            <button style="margin-top: 10px" @click="addCode">Add</button>
        </div>
        <font-awesome-icon class="icon" icon="heading" ref="headerbtn" @click="toggle(3)"></font-awesome-icon>
        <font-awesome-icon
            class="icon"
            icon="bold"
            ref="boldbtn"
            @click="toggle(4)"
            v-shortkey="['ctrl', 'b']"
            @shortkey="toggle(4)"
        ></font-awesome-icon>
        <font-awesome-icon
            class="icon"
            icon="italic"
            ref="italicbtn"
            @click="toggle(5)"
            v-shortkey="['ctrl', 'i']"
            @shortkey="toggle(5)"
        ></font-awesome-icon>
        <font-awesome-icon
            class="icon"
            icon="underline"
            ref="underlinebtn"
            @click="toggle(6)"
            v-shortkey="['ctrl', 'u']"
            @shortkey="toggle(6)"
        ></font-awesome-icon>
        <font-awesome-icon class="icon" icon="quote-left" ref="quotebtn" @click="toggle(7)"></font-awesome-icon>
        <font-awesome-icon class="icon" icon="calculator" ref="mathbtn" @click="toggle(8)"></font-awesome-icon>
    </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from "vue-property-decorator"
// import { Picker } from "emoji-mart-vue-fast"
// import "../assets/css/emoji-mart.css"

// @Component({
//     components: {
//         Picker
//     }
// })
@Component
export default class PostToolbar extends Vue {
    @Prop() protected editor: any
    protected popups: boolean[]
    protected functions: Array<{ function: (...args) => any; args: any[] }>
    protected POPUP_NUM = 9
    protected url: string
    protected name: string
    protected language: string
    protected refs = [
        "linkbtn",
        /*"emojibtn",*/
        "codebtn",
        "headerbtn",
        "boldbtn",
        "italicbtn",
        "underlinebtn",
        "quotebtn"
    ]

    constructor() {
        super()
        this.url = ""
        this.name = ""
        this.language = ""
        this.popups = []
        this.functions = [
            { function: this.makeLink, args: [] },
            null,
            null,
            { function: this.styleText, args: ["## ", ""] },
            { function: this.styleText, args: ["__", "__"] },
            { function: this.styleText, args: ["*", "*"] },
            { function: this.styleText, args: ["", "{style=\"text-decoration: underline\";}"] },
            { function: this.styleText, args: ["> ", ""] },
            { function: this.styleText, args: ["$", "$"] }
        ]
        for (let i = 0; i < this.POPUP_NUM; i++) {
            Vue.set(this.popups, i, false)
        }
    }

    public closeAll() {
        for (let i = 0; i < this.POPUP_NUM; i++) {
            Vue.set(this.popups, i, false)
        }
    }

    protected toggle(index) {
        for (let i = 0; i < this.POPUP_NUM; i++) {
            if (i === index) {
                Vue.set(this.popups, i, !this.popups[i])
                if (this.functions[i] != null) {
                    const fn = this.functions[i].function
                    const args = this.functions[i].args
                    this.insertIntoEditor(fn, args)
                }
            } else {
                Vue.set(this.popups, i, false)
            }
        }
    }

    protected insertIntoEditor(fn: (...args) => any, args: any[]) {
        const range = this.editor.doc.getSelection()
        const text = fn(...args)
        if (text) {
            this.editor.replaceSelection(text, range)
        }
    }

    protected makeLink() {
        return `[${this.editor.doc.getSelection()}](${this.editor.doc.getSelection()})`.replace(/\s/g, "")
    }

    protected styleText(prefix: string, suffix: string, line) {
        const prefixLen = prefix.length

        const suffixLen = suffix.length
        const val: string = this.editor
            .doc
            .getSelection()
        // Cool code that makes it so that if the selected text has identical prefixes/suffixes
        // (i.e bolded already), it removes the selected styling.
        const preSubstr = val.substring(0, prefixLen)
        const sufSubstr = val.substring(val.length - suffixLen, val.length)
        const re = new RegExp(`${prefix.replace(/(.)/g, "\\$1")}.*${suffix.replace(/(.)/g, "\\$1")}`)
        const match = val.match(re)
        if (preSubstr === prefix && sufSubstr === suffix) {
            return val.substring(prefixLen, val.length - suffixLen)
        } else if (match) {
            // I recently discovered that JavaScript has two completely different substring methods and
            // I got stuck on this because I thought they did the same thing. I am too lazy to change
            // it to 'substring' at this point because it works now and I have spent too much time on this.
            const firstStr = val.substr(0, match.index)
            const secondStr = val.substr(match.index + prefixLen, match[0].length - suffixLen - prefixLen)
            const thirdStr = val.substr(match.index + match[0].length)
            return firstStr + secondStr + thirdStr
        } else {
            return `${prefix}${val}${suffix}`
        }
    }

    protected get getStyle() {
        return this.$store.getters.getTheme === "dark"
            ? { "background-color": "$darkbg", "color": "white" }
            : {}
    }

    protected insertIntoEditorNoFunc(text) {
        const line = this.editor.doc.getSelection()
        if (text) {
            this.editor.replaceSelection(text, line)
        }
    }

    protected addEmoji(emoji) {
        this.insertIntoEditorNoFunc(emoji.colons)
        this.closeAll()
    }

    protected addCode(code) {
        let str = ""
        if (this.$store.getters.getContent !== "") {
            str = "\n"
        }
        this.insertIntoEditorNoFunc(
            `${str}\`\`\`${this.language.toLowerCase()}\nCODE HERE\n\`\`\``
        )
        this.closeAll()
    }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="sass">
@import "../assets/sass/variables.sass"
.picker
    z-index: 1
    position: absolute
.infield
    border-radius: 5px
.popup
    z-index: 5
    position: absolute
    height: auto
    border-radius: 5px
    padding: 10px
.toolbar
    width: 100%
    height: 36px
    border-radius: 10px
    margin-bottom: 10px
    padding: 5px
    overflow-y: auto
.toolbar::-webkit-scrollbar
    width: 10px

.toolbar::-webkit-scrollbar-thumb
    border-radius: 10px
    -webkit-box-shadow: inset 0 0 6px rgba(0,0,0,.3)

.toolbar::-webkit-scrollbar-track
    -webkit-box-shadow: inset 0 0 6px rgba(0,0,0,0.3)

.dark
    .popup
        background-color: $darkbg
    .toolbar
        background-color: $darkfg !important
    .infield
        border-color: $darkfg !important
        background-color: $darkbg !important
        color: white
    .toolbar::-webkit-scrollbar-thumb
        background-color: $darkscroll
    
.light
    .popup
        background-color: $lightbg
    .toolbar
        background-color: white !important
    .toolbar::-webkit-scrollbar-thumb
        background-color: #dddddd
.icon
    display: inline-block
    margin-left: 10px
    margin-right: 10px
.icon:hover
    cursor: pointer
</style>