<template>
    <div class="post">
        <div class="container">
            <router-link to="/">
                <font-awesome-icon style="margin-right: 10px" icon="arrow-left"></font-awesome-icon>Back to Home
            </router-link>
            <hr />
            <h1 class="bigtitle">{{header}}</h1>
            <div class="metadata">
                <span class="metaelement">
                    By:
                    <i>
                        <router-link :to="`/profile/${user}`">{{user}}</router-link>
                    </i>
                </span>
                <span class="metaelement">
                    <font-awesome-icon icon="calendar-alt"></font-awesome-icon>
                    <span class="metaelement">
                        {{dateCreated}},
                        <i>{{sinceCreation}}</i>
                    </span>
                </span>
                <span class="metaelement" v-if="createdAt !== updatedAt">
                    <font-awesome-icon icon="sync-alt"></font-awesome-icon>
                    <span class="metaelement">
                        {{dateUpdated}},
                        <i>{{sinceUpdate}}</i>
                    </span>
                </span>
                <span class="metaelement" v-if="commentCount">
                    <font-awesome-icon icon="comments"></font-awesome-icon>
                    {{commentCount}}
                </span>
                <span v-if="isAuthenticated && user === username" style="float: right">
                    <a @click="del" class="delete metaelement" :class="getTheme">Delete</a>
                    <a @click="edit" class="edit metaelement" :class="getTheme">Edit</a>
                </span>
            </div>
            <!-- <div v-if="isAuthenticated && user === username">
                <a @click="del" class="delete" :class="getTheme">Delete</a>
                <a @click="edit" class="edit" :class="getTheme">Edit</a>
            </div>-->
            <hr />
            <div v-if="editing">
                <label>Post Title</label>
                <br />
                <input
                    type="text"
                    :class="theme"
                    style="width: 100%"
                    class="title"
                    v-model="editTitle"
                />
                <br />
                <br />
                <div class="row">
                    <div class="col">
                        <Editor
                            :height="height"
                            :width="width"
                            v-model="editContent"
                            :initialContent="editContent"
                        />
                    </div>
                    <div class="col preview" ref="eContainer" :class="theme">
                        <Preview :content="editContent" />
                    </div>
                </div>
                <div style="padding-top: 15px">
                    <a class="button" style="margin-right: 10px" @click="editing = false">Cancel</a>
                    <a class="button" :class="theme" @click="makeEdits">Submit Edit</a>
                </div>
            </div>
            <div v-else>
                <div v-html="renderedContent"></div>
                <hr />
                <h1>Comments</h1>
                <a
                    v-if="isAuthenticated"
                    class="button"
                    :class="theme"
                    @click="showCommentPost"
                >Comment</a>
                <p
                    v-if="postingComment"
                    v-bind:class="{danger: commentContent.length > 2000}"
                    style="padding-top: 15px;"
                >Characters used: {{commentContent.length}} / 2000</p>
                <div class="row">
                    <div class="col">
                        <Editor
                            v-if="postingComment"
                            :height="height"
                            :width="width"
                            v-model="commentContent"
                            :initialContent="commentContent"
                        />
                    </div>
                    <div class="col preview" ref="container" :class="theme">
                        <Preview v-if="postingComment" :content="commentContent" />
                    </div>
                </div>
                <div v-if="postingComment" style="position: relative; padding-top: 15px">
                    <a class="button" :class="theme" @click="postComment">Submit Comment</a>
                </div>
                <hr />
                <Comment
                    v-for="comment in comments"
                    :key="comment.id"
                    :comment="comment"
                    :ownsPost="user === $store.state.username"
                    @deletedComment="updateCommentsOnDelete"
                />
                <b-button v-if="show" @click="load" :variant="theme">Load More Comments</b-button>
                <p v-else-if="comments.length === 0">No comments found.</p>
                <p v-else>All comments loaded.</p>
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
    protected pages: number;
    protected currentPage: number;
    protected commentCount: number | null;
    @Prop(String) protected readonly title!: string;
    @Prop(String) protected readonly id!: string;
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
        this.comments = [];
        this.width = null;
        this.height = null;
        this.postingComment = false;
        this.commentCount = null;
        this.pages = 1;
        this.currentPage = 1;
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
                "http://localhost:3000/deletepost",
                { id: this.id },
                { withCredentials: true }
            )
            .then(() => {
                this.$store.dispatch("fetchPosts", 1);
                this.$store.dispatch("addAlert", {
                    alertType: "success",
                    alertText: "Post deleted."
                });
                this.$router.push("/");
            })
            .catch(() => {
                this.$router.push("/");
            });
    }

    protected load() {
        this.currentPage += 1;
        this.fetchData();
    }

    get show() {
        return this.pages > this.currentPage;
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
            const newUrlTitle = (await axios.post(
                "http://localhost:3000/editpost",
                {
                    id: this.id,
                    urlTitle: this.title,
                    newTitle: this.editTitle,
                    newContent: this.editContent
                },
                { withCredentials: true }
            )).data.urlTitle;
            this.editContent = "";
            this.$store.dispatch("addAlert", {
                alertType: "success",
                alertText: "Post edited."
            });
            this.editing = false;
            // technically this doesn't initialize a new component (wtf vue?)
            this.$router.push(`/posts/${this.id}/${newUrlTitle}`);
            this.fetchData();
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
        if (this.commentContent.length <= 2000) {
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
                this.postingComment = false;
                await this.loadComments();
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
        } else {
            this.$store.dispatch("addAlert", {
                alertType: "warning",
                alertText: "Your comment cannot be longer than 2000 characters."
            });
        }
    }

    protected updateCommentsOnDelete() {
        this.loadComments();
    }

    protected mounted() {
        window.addEventListener("resize", this.updateDimensions.bind(this));
        this.fetchData();
        this.updateDimensions();
    }

    protected async loadComments() {
        const { data }: { data: PostModel } = await axios.get(
            `http://localhost:3000/post/${this.id}/${this.title}/${this.currentPage}`
        );
        this.commentCount = data.commentCount;
        this.comments = [];
        for (let i = 1; i <= this.currentPage; i++) {
            const comments = (await axios.get(
                `http://localhost:3000/post/${this.id}/${this.title}/${i}`
            )).data.comments;
            for (const comment of comments) {
                this.comments.push(comment);
            }
        }
    }

    protected get dateCreated() {
        if (this.createdAt) {
            return moment
                .utc(this.createdAt)
                .local()
                .format("MM/DD/YYYY, HH:mm");
        } else {
            return null;
        }
    }

    protected get dateUpdated() {
        if (this.updatedAt) {
            return moment
                .utc(this.updatedAt)
                .local()
                .format("MM/DD/YYYY, HH:mm");
        } else {
            return null;
        }
    }

    protected get sinceCreation() {
        if (this.createdAt) {
            return moment(this.createdAt).fromNow();
        } else {
            return null;
        }
    }

    protected get sinceUpdate() {
        if (this.updatedAt) {
            return moment(this.updatedAt).fromNow();
        } else {
            return null;
        }
    }

    protected async fetchData() {
        try {
            const { data }: { data: PostModel } = await axios.get(
                `http://localhost:3000/post/${this.id}/${this.title}/${this.currentPage}`
            );
            this.header = data.title;
            this.content = data.content;
            this.user = data.username;
            this.pages = data.pages;
            this.commentCount = data.commentCount;
            if (this.currentPage === 1) {
                this.comments = [];
            }
            for (const comment of data.comments) {
                this.comments.push(comment);
            }
            this.createdAt = data.createdAt;
            this.updatedAt = data.updatedAt;
        } catch (__) {
            // error
        }
    }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="sass">
.danger
    color: #ff7474
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
    padding-left: 15px
    padding-right: 15px
.delete
    color: #ff7474 !important
    cursor: pointer
    border-radius: 5px
    padding: 10px
    width: auto
    height: auto
.delete.light
    background-color: #e9ecef !important
.delete.dark
    background-color: #20212B !important
.edit
    color: #75ff74 !important
    cursor: pointer
    border-radius: 5px
    padding: 10px
.edit.light
    background-color: #e9ecef !important
.edit.dark
    background-color: #20212B !important
.preview
    padding: 0px
    border-radius: 5px
    overflow-y: auto
.metadata
    border-radius: 5px
    padding: 10px
.metaelement
    margin-left: 10px
    margin-right: 10px
.dark
    .button
        background-color: #2a2c39 !important
    .preview
        background-color: #2a2c39 !important
    .button
        background-color: #2a2c39 !important
    .title
        border-color: #20212B !important
        background-color: #2a2c39 !important
    .metadata
        background-color: #2a2c39 !important
.light
    .preview
        background-color: #FFFFFE !important
    .button
        background-color: white !important
    .title
        border-color: white !important
        background-color: white !important
    .metadata
        background-color: #FFFFFE !important
</style>
