<template>
    <div class="post">
        <div class="container">
            <a @click="$router.go(-1)">
                <font-awesome-icon style="margin-right: 10px" icon="arrow-left"></font-awesome-icon>Back
            </a>
            <div v-if="notFound === false">
                <hr />
                <h1 class="bigtitle">{{header}}</h1>
                <div class="metadata">
                    <span class="metaelement">
                        By:
                        <b>
                            <router-link :to="`/profile/${user}`">{{user}}</router-link>
                        </b>
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
                    <span
                        v-if="isAuthenticated && (user === username || editPerms) && !postingComment"
                        style="float: right"
                    >
                        <a @click="del" class="delete metaelement" :class="getTheme">Delete</a>
                        <a @click="edit" class="edit metaelement" :class="getTheme">Edit</a>
                    </span>
                    <div>
                        <div
                            style="display: inline-block"
                            v-for="(tag, index) in tags"
                            :key="index"
                            class="hashtag"
                            @click.stop="fooBar(tag)"
                        >#{{tag}}</div>
                    </div>
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
                    <label>Tags (please input tags as hashtags like this: '#mypost #specialcategory')</label>
                    <div style="position: relative">
                        <div
                            style="display: inline-block"
                            v-for="(tag, index) in parsedTags"
                            :key="index"
                            :class="theme"
                            class="hashtag-edit"
                        >
                            {{tag}}
                            <font-awesome-icon
                                @click="removeTag(tag)"
                                icon="times-circle"
                                style="font-size: 12px margin-left: 4pxfloat: right position: absolute cursor: pointer"
                            />
                        </div>
                    </div>
                    <br />
                    <input
                        type="text"
                        :class="theme"
                        style="width: 100%"
                        class="title"
                        v-model="editingTags"
                    />
                    <br />
                    <br />
                    <MarkdownEditor height="300px" width="auto" v-model="editContent" :initialContent="editContent" :title="title"/>
                    <div style="padding-top: 15px">
                        <a class="button" style="margin-right: 10px" @click="editing = false">Cancel</a>
                        <a class="button" :class="theme" @click="makeEdits">Submit Edit</a>
                    </div>
                </div>
                <div v-else>
                    <div style="word-wrap: break-word" v-html="renderedContent"></div>
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
                        v-bind:class="{danger: commentLimit && commentContent.length > commentLimitVal}"
                        style="padding-top: 15px"
                    >
                        Characters used: {{commentContent.length}}
                        <span
                            v-if="commentLimit"
                        >/ {{commentLimitVal}}</span>
                    </p>
                    <MarkdownEditor v-if="postingComment" height="300px" width="auto" style="padding-bottom: 15px" v-model="commentContent" :initialContent="commentContent"/>
                    <div v-if="postingComment">
                        <a class="button" style="margin-right: 10px" @click="postingComment = false">Cancel</a>
                        <a class="button" :class="theme" @click="postComment">Submit Comment</a>
                    </div>
                    <hr />
                    <Comment
                        v-for="comment in comments"
                        :key="comment.id"
                        :comment="comment"
                        :ownsPost="user === $store.state.username"
                        @deletedComment="updateCommentsOnDelete"
                        :editPerms="editPerms"
                    />
                    <b-button v-if="show" @click="load" :variant="theme">Load More Comments</b-button>
                    <p v-else-if="comments.length === 0">No comments found.</p>
                    <p v-else>All comments loaded.</p>
                </div>
            </div>
            <div v-else-if="notFound === null" style="text-align: center">
                <LoadingAnimation></LoadingAnimation>
            </div>
            <div v-else-if="notFound === true">
                <h1>No post found.</h1>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from "vue-property-decorator"
import axios from "axios"
import { Getter } from "vuex-class"
import moment from "moment"
import { PostModel } from "../models/post"
import { CommentModel } from "../models/comment"
import Comment from "./Comment.vue"
import Editor from "./Editor.vue"
import Preview from "./Preview.vue"
import { md } from "../mdparser"
import config from "../config"
import LoadingAnimation from "./LoadingAnimation.vue"
import { BButton } from "bootstrap-vue"
import MarkdownEditor from "./MarkdownEditor.vue"

@Component({
    components: {
        Comment,
        LoadingAnimation,
        BButton, 
        MarkdownEditor
    }
})
export default class Post extends Vue {
    public $refs: {
        container: HTMLDivElement;
        eContainer: HTMLDivElement;
    }
    protected header: string | null
    protected content: string | null
    protected renderedContent: string | null
    protected user: string | null
    protected createdAt: any
    protected updatedAt: any
    protected comments: CommentModel[] | null
    protected width: number | null
    protected height: number | null
    protected postingComment: boolean
    protected editing = false
    protected pages: number
    protected currentPage: number
    protected commentCount: number | null
    protected notFound: boolean | null
    protected tags: string[] | null
    protected editingTags: string | null
    protected commentLimit: boolean | null
    protected commentLimitVal: number | null
    protected editPerms: boolean | null
    @Prop(String) protected readonly title!: string
    @Prop(String) protected readonly id!: string
    @Getter("getTheme") private getTheme: string
    @Getter("isAuthenticated") private isAuthenticated: boolean

    constructor() {
        super()
        this.header = null
        this.content = null
        this.renderedContent = null
        this.user = null
        this.createdAt = null
        this.updatedAt = null
        this.comments = []
        this.width = null
        this.height = null
        this.postingComment = false
        this.commentCount = null
        this.pages = 1
        this.currentPage = 1
        this.tags = null
        this.notFound = null
        this.editingTags = ""
        this.commentLimit = null
        this.commentLimitVal = null
        this.editPerms = null
    }

    @Watch("content")
    protected renderContent() {
        this.renderedContent = md.render(this.content)
    }

    protected showCommentPost() {
        this.postingComment = !this.postingComment
    }

    protected del() {
        axios
            .post(
                `${config.apiUrl}/deletepost`,
                { id: this.id },
                { withCredentials: true }
            )
            .then((res) => {
                this.$store.dispatch("fetchPosts", 1)
                this.$store.dispatch("addAlert", {
                    alertType: "success",
                    alertText: res.data.success
                })
                this.$router.push("/")
            })
            .catch((err) => {
                if (err.response) {
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
                this.$router.push("/")
            })
    }

    protected load() {
        this.currentPage += 1
        this.fetchData()
    }

    get show() {
        return this.pages > this.currentPage
    }

    get theme() {
        return this.$store.getters.getTheme
    }

    get isAdmin() {
        return this.$store.state.isAdmin
    }

    get username() {
        return this.$store.state.username
    }

    get commentContent() {
        return this.$store.getters.getCommentContent
    }
    set commentContent(val) {
        this.$store.dispatch("editCommentContent", val)
    }

    get editContent() {
        return this.$store.getters.getEditContent
    }
    set editContent(val) {
        this.$store.dispatch("editEditContent", val)
    }

    get editTitle() {
        return this.$store.getters.getEditTitle
    }
    set editTitle(val) {
        this.$store.dispatch("editEditTitle", val)
    }

    protected edit() {
        if (!this.editing) {
            this.postingComment = false
            this.editContent = this.content
            this.editTitle = this.header
            this.editing = true
        } else {
            this.editing = false
        }
    }

    protected async makeEdits() {
        try {
            const { data } = await axios.post(
                `${config.apiUrl}/editpost`,
                {
                    id: this.id,
                    urlTitle: this.title,
                    newTitle: this.editTitle,
                    newContent: this.editContent,
                    tags: this.editingTags
                },
                { withCredentials: true }
            )
            const newUrlTitle = data.newUrlTitle
            const msg = data.success
            this.editContent = ""
            this.$store.dispatch("addAlert", {
                alertType: "success",
                alertText: msg
            })
            this.editing = false
            if (newUrlTitle === this.title) {
                this.fetchData()
            } else {
                this.$router.push(`/posts/${this.id}/${newUrlTitle}`)
            }
        } catch (err) {
            if (err.response.status === 401) {
                this.$store.dispatch("forceLogout")
                this.$router.push("/login")
                this.editing = false
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
        }
    }

    protected async postComment() {
        try {
            await axios.post(
                `${config.apiUrl}/comment`,
                {
                    id: this.id,
                    urlTitle: this.title,
                    content: this.commentContent
                },
                { withCredentials: true }
            )
            this.commentContent = ""
            this.$store.dispatch("addAlert", {
                alertType: "success",
                alertText: "Comment successfully created."
            })
            this.postingComment = false
            await this.loadComments()
        } catch (err) {
            if (err.response.status === 401) {
                this.$store.dispatch("forceLogout")
                this.$router.push("/login")
                this.postingComment = false
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
        }
    }

    protected updateCommentsOnDelete() {
        this.loadComments()
    }

    protected mounted() {
        this.fetchData()
    }

    protected async loadComments() {
        const { data }: { data: PostModel } = await axios.get(
            `${config.apiUrl}/post/${this.id}/${this.title}/${this.currentPage}`,
            { withCredentials: true }
        )
        this.commentCount = data.commentCount
        this.comments = []
        for (let i = 1; i <= this.currentPage; i++) {
            const comments = (await axios.get(
                `${config.apiUrl}/post/${this.id}/${this.title}/${i}`
            )).data.comments
            for (const comment of comments) {
                this.comments.push(comment)
            }
        }
    }

    protected get dateCreated() {
        if (this.createdAt) {
            return moment
                .utc(this.createdAt)
                .local()
                .format("MM/DD/YYYY, HH:mm")
        } else {
            return null
        }
    }

    protected get dateUpdated() {
        if (this.updatedAt) {
            return moment
                .utc(this.updatedAt)
                .local()
                .format("MM/DD/YYYY, HH:mm")
        } else {
            return null
        }
    }

    protected get sinceCreation() {
        if (this.createdAt) {
            return moment(this.createdAt).fromNow()
        } else {
            return null
        }
    }

    get parsedTags() {
        const re = /(^|\s)(#[a-z\d-_]+)/g
        let match
        const foo = []
        while ((match = re.exec(this.editingTags))) {
            if (!foo.find((thing) => thing === match[2])) {
                foo.push(match[2])
            }
        }
        return foo
    }

    // substring MAGIC
    protected removeTag(tag: string) {
        const index = (this.editingTags as string).indexOf(tag)
        this.editingTags =
            (this.editingTags as string).substring(0, index) +
            (this.editingTags as string).substring(
                index + tag.length + 1,
                this.editingTags.length
            )
    }

    protected get sinceUpdate() {
        if (this.updatedAt) {
            return moment(this.updatedAt).fromNow()
        } else {
            return null
        }
    }

    protected fooBar(tag) {
        this.$router.push(`/tag/${tag}`)
    }

    protected async fetchData() {
        try {
            this.notFound = null
            const { data }: { data: PostModel } = await axios.get(
                `${config.apiUrl}/post/${this.id}/${this.title}/${this.currentPage}`,
                { withCredentials: true }
            )
            this.header = data.title
            document.title = `${this.header} | Blog`
            // this.$store.dispatch("updateTitle", this.header)
            // this.$router.after
            this.content = data.content
            this.user = data.username
            this.pages = data.pages
            this.commentCount = data.commentCount
            this.tags = data.tags
            this.commentLimit = data.commentLimit
            this.commentLimitVal = data.commentLimitVal
            this.editPerms = data.requiredManagePerms
            this.editingTags = ""
            this.tags.forEach((tag) => (this.editingTags += `#${tag} `))
            if (this.currentPage === 1) {
                this.comments = []
            }
            for (const comment of data.comments) {
                this.comments.push(comment)
            }
            this.createdAt = data.createdAt
            this.updatedAt = data.updatedAt
            this.notFound = false
        } catch (err) {
            this.notFound = true
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
a:hover
    cursor: pointer
.hashtag
    margin: 10px 
    padding-left: 5px
    padding-right: 5px
    padding-top: 5px
    padding-bottom: 5px 
    border-radius: 5px
    transition: 0.25s
    -webkit-transition: 0.25s
.hashtag-edit
    margin: 10px 
    padding-left: 10px
    padding-right: 20px
    padding-top: 5px
    padding-bottom: 5px 
    border-radius: 5px
.hashtag:hover
    cursor: pointer
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
    .hashtag
        background-color: black !important
    .hashtag:hover
        color: #FF79c6
    .hashtag-edit
        background-color: black !important
    .hashtag:hover
        color: #FF79c6
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
    .hashtag
        background-color: #e9ecef !important
    .hashtag:hover
        color: #00ccff
    .hashtag-edit
        background-color: white 
    .hashtag-edit:hover
        color: #00ccff
</style>
