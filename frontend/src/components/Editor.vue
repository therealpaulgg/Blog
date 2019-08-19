<template>
    <div class="editor">
        <div class="codemirror">
            <PostToolbar :editor="this.editor"/>
            <codemirror ref="editor" class="codemirror" v-model="content" :options="cmOption"></codemirror>
        </div>
    </div>
</template>
<script lang="ts">
import { Component, Vue, Watch, Prop } from "vue-property-decorator"
import axios from "axios"
import "codemirror/mode/markdown/markdown.js"
import "codemirror/theme/dracula.css"
import "codemirror/theme/base16-light.css"
import "codemirror/lib/codemirror.css"
import { codemirror } from "vue-codemirror"
import PostToolbar from "./PostToolbar.vue"

@Component({
    components: {
        codemirror,
        PostToolbar
    }
})
export default class Editor extends Vue {
    public cmOption: any
    public $refs: {
        editor: any
    }
    @Prop(String) protected initialContent: string
    @Prop(String) height: string
    @Prop(String) width: string
    protected content: string
    protected editor: any

    constructor() {
        super()
        if (this.initialContent) {
            this.content = this.initialContent
        } else {
            this.content = ""
        }
        this.editor = null
        this.cmOption = {
            tabSize: 4,
            styleActiveLine: true,
            lineNumbers: true,
            lineWrapping: true,
            line: true,
            mode: 'markdown',
            theme: this.editorTheme
        }
    }

    @Watch("content")
    protected send() {
        this.$emit("input", this.content)
    }

    mounted() {
        this.$refs.editor.cminstance.setOption("scrollbarStyle", "null")
        this.$refs.editor.cminstance.setSize(this.width, this.height)
        this.editor = this.$refs.editor.cminstance
    }

    @Watch("editorTheme")
    protected um(newval, oldval) {
        if (this.$refs.editor != null) {
            console.log(this.$refs.editor.cminstance)
            this.$refs.editor.cminstance.setOption("theme", newval)
            this.$refs.editor.cminstance.refresh()
        }
    }

    get theme() {
        return this.$store.getters.getTheme
    }

    get editorTheme() {
        const theme = this.$store.getters.getTheme
        return theme === "dark" ? "dracula" : "base16-light"
    }
}
</script>

<style lang="sass">
.CodeMirror
    font-family: "Fira Code", monospace
    font-size: 14px
    width: auto
</style>
