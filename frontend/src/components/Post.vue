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
            <div v-if="isAuthenticated && user === username">
                <a @click="del" class="delete" :class="getTheme">Delete</a>
                <a @click="edit" class="edit" :class="getTheme">Edit</a>
            </div>
            <hr />
            <div v-if="editing">
                <label>Post Title</label>
                <br />
                <input type="text" :class="theme" style="width: 100%" class="title" v-model="editTitle" />
                <br />
                <br>
                <div class="row">
                    <div class="col" ref="eContainer">
                        <Editor
                            :height="height"
                            :width="width"
                            v-model="editContent"
                            :initialContent="editContent"
                        />
                    </div>
                    <div class="col preview" :class="theme">
                        <Preview :content="editContent" />
                    </div>
                </div>
                <a 
                    class="button"
                    @click="editing = false"
                >
                Cancel
                </a>
                <a
                    class="button"
                    :class="theme"
                    @click="makeEdits"
                >Submit Edit</a>
            </div>
            <div v-else>
                <div v-html="renderedContent"></div>
                <hr />
                <h1>Comments</h1>
                <a v-if="isAuthenticated" class="button" :class="theme" @click="showCommentPost">Comment</a>
                <br />
                <br />
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
    </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from "vue-property-decorator";
import axios from "axios";
import { Getter } from "vuex-class";
import moment from "moment";
import { PostModel } from "../models/post";
import { CommentModel } from "../models/comment";
import Comment from "./Comment.vue";
import Editor from "./Editor.vue";
import Preview from "./Preview.vue";
import { md } from "../mdparser";

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
        eContainer: HTMLDivElement;
    };
    protected header: string | null;
    protected content: string | null;
    protected renderedContent: string | null;
    protected user: string | null;
    protected createdAt: any;
    protected updatedAt: any;
    protected comments: CommentModel[] | null;
    protected width: number | null;
    protected height: number | null;
    protected postingComment: boolean;
    protected editing = false;
    @Prop(String) protected readonly title!: string;
    @Getter("getTheme") private getTheme: string;
    @Getter("isAuthenticated") private isAuthenticated: boolean;

    constructor() {
        super();
        this.header = null;
        this.content = null;
        this.renderedContent = null;
        this.user = null;
        this.createdAt = null;
        this.updatedAt = null;
        this.comments = null;
        this.width = null;
        this.height = null;
        this.postingComment = false;
    }

    @Watch("content")
    protected renderContent() {
        this.renderedContent = md.render(this.content);
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

    get username() {
        return this.$store.state.username;
    }

    get commentContent() {
        return this.$store.getters.getCommentContent;
    }
    set commentContent(val) {
        this.$store.dispatch("editCommentContent", val);
    }

    get editContent() {
        return this.$store.getters.getEditContent;
    }
    set editContent(val) {
        this.$store.dispatch("editEditContent", val);
    }

    get editTitle() {
        return this.$store.getters.getEditTitle;
    }
    set editTitle(val) {
        this.$store.dispatch("editEditTitle", val);
    }

    protected edit() {
        if (!this.editing) {
            this.editContent = this.content;
            this.editTitle = this.header;
            this.editing = true;
        } else {
            this.editing = false;
        }
    }

    protected updateDimensions() {
        if (this.$refs.container) {
            this.width = this.$refs.container.clientWidth;
        } else if (this.$refs.eContainer) {
            this.width = this.$refs.eContainer.clientWidth;
        } else {
            this.width = null;
        }
        this.height = 300;
    }

    protected async makeEdits() {
        try {
            await axios.post(
                "http://localhost:3000/editpost",
                { urlTitle: this.title, newTitle: this.editTitle, newContent: this.editContent },
                { withCredentials: true }
            );
            this.editContent = "";
            this.$store.dispatch("addAlert", {
                alertType: "success",
                alertText: "Post edited."
            });
            this.$router.push("/")
        } catch (err) {
            // The user should never actually get to this point in theory,
            // but it is here for safety. (Delete cookies)
            this.$store.dispatch("forceLogout");
            this.$store.dispatch("addAlert", {
                alertType: "danger",
                alertText:
                    "There was an authentication problem. Please log in again."
            });
        }
    }

    protected async postComment() {
        try {
            await axios.post(
                "http://localhost:3000/comment",
                { urlTitle: this.title, content: this.commentContent },
                { withCredentials: true }
            );
            this.commentContent = "";
            this.$store.dispatch("addAlert", {
                alertType: "success",
                alertText: "Comment successfully created."
            });
            await this.fetchData();
        } catch (err) {
            // The user should never actually get to this point in theory,
            // but it is here for safety. (Delete cookies)
            this.$store.dispatch("forceLogout");
            this.$store.dispatch("addAlert", {
                alertType: "danger",
                alertText:
                    "There was an authentication problem. Please log in again."
            });
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
.title
    border-radius: 5px   
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
    .title
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
