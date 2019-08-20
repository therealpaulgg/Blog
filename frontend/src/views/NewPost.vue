<template>
    <div class="newpost">
        <label>Post Title</label>
        <br />
        <input type="text" :class="theme" style="width: 100%" class="title" v-model="title" />
        <br />
        <br />
        <label>Tags (please input tags as hashtags like this: '#mypost #specialcategory')</label>
        <div style="position: relative">
            <div
                style="display: inline-block"
                v-for="(tag, index) in parsedTags"
                :key="index"
                :class="theme"
                class="hashtag"
            >
                {{tag}}
                <font-awesome-icon
                    @click="removeTag(tag)"
                    icon="times-circle"
                    style="font-size: 12px; margin-left: 4px;float: right; position: absolute; cursor: pointer"
                />
            </div>
        </div>
        <br />
        <input type="text" :class="theme" style="width: 100%" class="title" v-model="tags" />
        <br />
        <br />
        <label>Tags not in lowercase or with special characters will not be submitted.</label>
        <MarkdownEditor height="500px" width="auto" v-model="content" :initialContent="content" :title="title" :useHtml="true" />

        <br />
        <a class="button" :class="theme" @click="post">Post</a>
    </div>
</template>

<script lang="ts">
import { Component, Vue, Watch } from "vue-property-decorator"
import axios from "axios"
import { PostModel } from "../models/post"
import { mdHtml } from "../mdparser"
import Editor from "../components/Editor.vue"
import config from "../config"
import Preview from "../components/Preview.vue"
import MarkdownEditor from "../components/MarkdownEditor.vue"

@Component({
    components: {
        Editor,
        Preview,
        MarkdownEditor
    }
})
export default class NewPost extends Vue {
    public $refs: {
        editcol: HTMLDivElement
        editor: any
    }
    protected renderedContent: string
    protected ready = false
    protected editor = null
    protected width: number | null
    protected height: number | null
    private options = {
        fontLigatures: true,
        fontFamily: "Fira Code",
        wordWrap: true,
        minimap: { enabled: false }
    }

    constructor() {
        super()
        this.renderedContent = ""
        this.width = null
        this.height = null
    }

    protected mounted() {
        if (!this.isAuthenticated) {
            this.$router.push("/")
        }
    }

    get isAuthenticated() {
        return this.$store.getters.isAuthenticated
    }

    get theme() {
        return this.$store.getters.getTheme
    }

    get title() {
        return this.$store.getters.getPostTitle
    }
    set title(val) {
        this.$store.dispatch("editPostTitle", val)
    }

    get content() {
        return this.$store.getters.getContent
    }
    set content(val) {
        this.$store.dispatch("editContent", val)
    }

    get tags() {
        return this.$store.getters.getTags
    }
    set tags(val) {
        this.$store.dispatch("editTags", val)
    }

    get parsedTags() {
        const re = /(^|\s)(#[a-z\d-_]+)/g
        let match
        const foo = []
        while ((match = re.exec(this.tags))) {
            if (!foo.find((thing) => thing === match[2])) { foo.push(match[2]) }
        }
        return foo
    }

    // substring MAGIC
    protected removeTag(tag: string) {
        const index = (this.tags as string).indexOf(tag)
        this.tags =
            (this.tags as string).substring(0, index) +
            (this.tags as string).substring(
                index + tag.length + 1,
                this.tags.length
            )
    }

    get vsTheme() {
        const theme = this.$store.getters.getTheme
        return theme === "dark" ? "dracula" : "vs-light"
    }

    protected post() {
        axios
            .post(
                `${config.apiUrl}/newpost`,
                { title: this.title, content: this.content, tags: this.tags },
                { withCredentials: true }
            )
            .then((res) => {
                this.title = ""
                this.content = ""
                this.$store.dispatch("fetchPosts", 1)
                this.$router.push("/")
                this.$store.dispatch("addAlert", {
                    alertType: "success",
                    alertText: res.data.success
                })
            })
            .catch((err) => {
                if (err.response.status === 401) {
                    this.$store.dispatch("forceLogout")
                    this.$router.push("/login")
                }
                if (err.response.data) {
                    this.$store.dispatch("addAlert", {
                        alertType: "danger",
                        alertText: err.response.data.error
                    })
                } else {
                    this.$store.dispatch("addAlert", {
                        alertType: "danger",
                        alertText: "Something went wrong."
                    })
                }
            })
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
    padding-left: 15px
    padding-right: 15px   
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
.hashtag
    margin: 10px 
    padding-left: 10px
    padding-right: 20px
    padding-top: 5px
    padding-bottom: 5px 
    border-radius: 5px
.dark
    .button
        background-color: #2a2c39 !important
    .title
        border-color: #20212B !important
        background-color: #2a2c39 !important
    .hashtag
        background-color: black !important
.light
    .button
        background-color: white !important
    .title
        border-color: white !important
        background-color: white !important
    .hashtag
        background-color: white !important
</style>

