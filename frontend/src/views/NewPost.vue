<template>
    <div class="newpost">
        <label>Post Title</label>
        <br />
        <input type="text" :class="theme" style="width: 100%" class="title" v-model="title" />
        <br />
        <br />
        <div class="container">
            <div class="row">
                <div class="col">
                    <Editor :height="height" :width="width" v-model="content"/>
                </div>
                <div class="col preview" ref="editcol" :class="theme">
                    <Preview :title="title" :content="content" />
                </div>
            </div>
        </div>

        <br />
        <a class="button" :class="theme" @click="post">Post</a>
    </div>
</template>

<script lang="ts">
import { Component, Vue, Watch } from "vue-property-decorator";
import axios from "axios";
import { PostModel } from "../models/post";
import { md } from "../mdparser";
import Editor from "../components/Editor.vue";
import Preview from "../components/Preview.vue";

@Component({
    components: {
        Editor,
        Preview
    }
})
export default class NewPost extends Vue {
    public $refs: {
        editcol: HTMLDivElement;
        editor: any;
    };
    protected title: string;
    protected renderedContent: string;
    protected ready = false;
    protected editor = null;
    protected width: number | null;
    protected height: number | null;
    private options = {
        fontLigatures: true,
        fontFamily: "Fira Code",
        wordWrap: true,
        minimap: { enabled: false }
    };

    constructor() {
        super();
        this.title = "";
        this.renderedContent = "";
        this.width = null;
        this.height = null;
    }

    protected updateDimensions() {
        this.width = this.$refs.editcol.clientWidth;
        this.height = this.$refs.editcol.clientHeight;
    }

    protected mounted() {
        window.addEventListener("resize", this.updateDimensions.bind(this));
        this.width = this.$refs.editcol.clientWidth;
        this.height = this.$refs.editcol.clientHeight;
    }

    get theme() {
        return this.$store.getters.getTheme;
    }

    get content() {
        return this.$store.getters.getContent;
    }
    set content(val) {
        this.$store.dispatch("editContent", val);
    }

    get vsTheme() {
        const theme = this.$store.getters.getTheme;
        return theme === "dark" ? "dracula" : "vs-light";
    }

    protected post() {
        axios
            .post(
                "http://localhost:3000/newpost",
                { title: this.title, content: this.content },
                { withCredentials: true }
            )
            .then(() => {
                this.$store.dispatch("fetchPosts");
                this.$router.push("/");
            })
            .catch((err) => err);
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
    overflow-y: scroll
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

