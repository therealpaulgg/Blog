<template>
    <div class="post">
        <div class="container">
            <router-link to="/">
                <font-awesome-icon style="margin-right: 10px" icon="arrow-left"></font-awesome-icon>Back to Home
            </router-link>
            <hr />
            <h1 class="bigtitle">{{header}}</h1>
            <p>by {{user}}</p>
            <p>Created {{createdAt}}</p>
            <p v-if="createdAt !== updatedAt">Updated {{updatedAt}}</p>
            <div v-if="isAuthenticated">
                <a @click="del" class="delete" :class="getTheme">Delete</a>
                <a @click="edit" class="edit" :class="getTheme">Edit</a>
            </div>
            <hr />
            <!-- <p v-if="title == 'foo'">CYKA BLYAD</p> -->
            <div v-html="content"></div>
            <hr />
            <h1>Comments</h1>
            <a class="button" :class="theme" @click="showCommentPost">Comment</a>
            <br>
            <br>
            <div class="row" style="padding-bottom: 15px;">
                <div class="col" ref="container">
                    <Editor
                        v-if="postingComment"
                        :height="height"
                        :width="width"
                        v-model="commentContent"
                        :initialContent="commentContent"
                    />
                </div>
                <div class="col preview" :class="theme">
                    <Preview v-if="postingComment" :content="commentContent" />
                </div>
            </div>
            <a
                class="button"
                v-if="postingComment"
                :class="theme"
                @click="postComment"
            >Submit Comment</a>
            <hr />
            <Comment v-for="(comment, index) in comments" :key="index" :comment="comment" />
        </div>
    </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";
import axios from "axios";
import { Getter } from "vuex-class";
import moment from "moment";
import { PostModel } from "../models/post";
import { CommentModel } from "../models/comment";
import Comment from "./Comment.vue";
import Editor from "./Editor.vue";
import Preview from "./Preview.vue";

@Component({
    components: {
        Comment,
        Editor,
        Preview
    }
})
export default class Post extends Vue {
    public $refs: {
        container: HTMLDivElement;
    };
    protected header: string | null;
    protected content: string | null;
    protected user: string | null;
    protected createdAt: any;
    protected updatedAt: any;
    protected comments: CommentModel[] | null;
    protected width: number | null;
    protected height: number | null;
    protected postingComment: boolean;
    @Prop(String) protected readonly title!: string;
    @Getter("getTheme") private getTheme: string;
    @Getter("isAuthenticated") private isAuthenticated: boolean;

    constructor() {
        super();
        this.header = null;
        this.content = null;
        this.user = null;
        this.createdAt = null;
        this.updatedAt = null;
        this.comments = null;
        this.width = null;
        this.height = null;
        this.postingComment = false;
    }

    protected showCommentPost() {
        this.postingComment = !this.postingComment;
    }

    protected del() {
        axios
            .post(
                "http://localhost:3000/delete",
                { urlTitle: this.title },
                { withCredentials: true }
            )
            .then(() => {
                this.$store.dispatch("fetchPosts");
                this.$router.push("/");
            })
            .catch(() => {
                this.$router.push("/");
            });
    }

    get theme() {
        return this.$store.getters.getTheme;
    }

    get commentContent() {
        return this.$store.getters.getCommentContent;
    }
    set commentContent(val) {
        this.$store.dispatch("editCommentContent", val);
    }

    protected edit() {
        // TODO
    }

    protected updateDimensions() {
        if (this.$refs.container) {
            this.width = this.$refs.container.clientWidth;
        } else {
            this.width = null;
        }
        this.height = 300;
    }

    protected async postComment() {
        try {
            await axios.post(
                "http://localhost:3000/comment",
                { urlTitle: this.title, content: this.commentContent },
                { withCredentials: true }
            );
            this.commentContent = "";
            await this.fetchData();
        } catch (err) {
            // TODO
        }
    }

    protected mounted() {
        window.addEventListener("resize", this.updateDimensions.bind(this));
        this.fetchData();
        this.updateDimensions();
    }

    protected async fetchData() {
        const { data }: { data: PostModel } = await axios.get(
            `http://localhost:3000/post/${this.title}`
        );
        this.header = data.title;
        this.content = data.content;
        this.user = data.username;
        this.comments = data.comments;
        this.createdAt = moment
            .utc(data.createdAt)
            .local()
            .format("MM/DD/YYYY, HH:mm");
        this.updatedAt = moment
            .utc(data.updatedAt)
            .local()
            .format("MM/DD/YYYY, HH:mm");
    }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="sass">
.button
    border-radius: 5px
    padding: 10px
    cursor: pointer
.bigtitle
    font-size: 50px
    margin-bottom: 20px
    margin-right: 10px
    word-wrap: break-word
    white-space: normal
    width: 100%
.delete
    color: #ff7474 !important
    cursor: pointer
    border-radius: 5px
    padding: 10px
    margin-top: 10px
    width: auto
    height: auto
.delete.light
    background-color: white !important
.delete.dark
    background-color: #2a2c39 !important
.edit
    color: #75ff74 !important
    cursor: pointer
    border-radius: 5px
    padding: 10px
    margin: 10px
.edit.light
    background-color: white !important
.edit.dark
    background-color: #2a2c39 !important
.preview
    padding: 0px
    border-radius: 5px
    overflow-y: auto
.dark
    .button
        background-color: #2a2c39 !important
    .preview
        background-color: #2a2c39 !important
    .button
        background-color: #2a2c39 !important
.light
    .preview
        background-color: #FFFFFE !important
    .button
        background-color: white !important
</style>
