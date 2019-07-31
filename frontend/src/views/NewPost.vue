<template>
    <div class="newpost">
        <label>Post Title</label>
        <br />
        <input type="text" :class="theme" style="width: 100%" class="title" v-model="title" />
        <br>
        <br>
        <div class="row">
            <div class="col">
                <MonacoEditor
                    class="editor"
                    language="markdown"
                    v-model="content"
                    :theme="vsTheme"
                    :options="options"
                />
            </div>
            <div class="col preview" :class="theme">
                <div id="preview" class="break" v-html="`<h1>${title}</h1>` + renderedContent"></div>
            </div>
        </div>

        <br />
        <!-- <button @click="logText">Log text</button> -->
        <a class="button" :class="theme" @click="post">Post</a>
    </div>
</template>

<script lang="ts">
import { Component, Vue, Watch } from "vue-property-decorator";
import axios from "axios";
import { Post } from "../models/post";
import { md } from "../mdparser";
import MonacoEditor from "vue-monaco";
import dracula from "../assets/Dracula.json";

@Component({
    components: {
        MonacoEditor
    }
})
export default class NewPost extends Vue {
    @Watch("content")
    test(val: string, oldVal: string) {
        try {
            let foo = md.render(val);
            this.renderedContent = foo;
        } catch (err) {
            console.error(err);
        }
    }

    mounted() {
        window.monaco.editor.defineTheme("dracula", dracula);
        window.monaco.editor.setTheme(this.vsTheme);
    }

    options = {
        fontLigatures: true,
        fontFamily: "Fira Code",
        wordWrap: true,
        minimap: { enabled: false }
    };

    get theme() {
        return this.$store.getters.getTheme;
    }

    get vsTheme() {
        let theme = this.$store.getters.getTheme;
        return theme == "dark" ? "dracula" : "vs-light";
    }

    title: string;
    content: string;
    renderedContent: string;

    constructor() {
        super();
        this.title = "";
        this.content = "";
        this.renderedContent = "";
    }

    post() {
        axios.post(
            "http://localhost:3000/newpost",
            { title: this.title, content: this.content },
            { withCredentials: true }
        );
    }
}
</script>

<style scoped lang="sass">
.button
    border-radius: 5px
    padding: 10px
    cursor: pointer
.title
    border-radius: 5px    
.editor
    height: 700px
    width: 100%
.break
    position: absolute
    width: 100%
    // padding: 20px
    word-wrap: break-word
    margin: 0px
    padding: 20px
.preview
    padding: 0px
    border-radius: 5px
.dark
    .preview
        background-color: #2a2c39 !important
    .button
        background-color: #2a2c39 !important
    .title
        border-radius: 5px
        border-color: #2a2c39 !important
        background-color: #20212B !important
.light
    .preview
        background-color: #FFFFFE !important
    .button
        background-color: white !important
    .title
        border-color: white !important
        background-color: white !important

</style>

