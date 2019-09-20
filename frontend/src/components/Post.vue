<template>
    <div class="post">
        <div class="container">
            <a @click="$router.go(-1)">
                <font-awesome-icon style="margin-right: 10px" icon="arrow-left"></font-awesome-icon>Back
            </a>
        </div>
        <div v-if="notFound === false" style="position: relative">
            <div class="container">
                <hr />
                <h1 class="bigtitle">{{header}}</h1>
                <div v-if="sharableUrl" class="urlshare">
                    Sharable URL:
                    <a :href="sharableUrl">{{sharableUrl}}</a>
                </div>
                <div class="metadata">
                    <div style="position: relative">
                        <div style="margin: 0 auto; display: block; margin-bottom: 15px;">
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
                            <span class="metaelement">
                                <font-awesome-icon icon="eye" v-if="visibility === 'public'"></font-awesome-icon>
                                <font-awesome-icon icon="key" v-if="visibility === 'login_only'"></font-awesome-icon>
                                <font-awesome-icon
                                    icon="user-secret"
                                    v-if="visibility === 'private'"
                                ></font-awesome-icon>
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
                        <div
                            v-if="isAuthenticated && (user === username || editPerms) && !postingComment"
                            class="buttonpos"
                        >
                            <font-awesome-icon
                                icon="ellipsis-h"
                                class="hamburger"
                                @click="reveal"
                                ref="hamburgerMenu"
                            ></font-awesome-icon>
                        </div>
                        <div
                            class="dropmenu"
                            v-if="revealBtns"
                            v-closable="{
                                handler: 'reveal',
                                exclude: refs
                            }"
                        >
                            <a @click="del" class="delete dropbtn" :class="getTheme">Delete</a>
                            <a
                                v-if="editable || editPerms"
                                @click="edit"
                                class="edit dropbtn"
                                :class="getTheme"
                            >Edit</a>
                            <a
                                class="dropbtn"
                                :class="getTheme"
                                @click="changeSettings"
                            >Post Settings</a>
                            <a class="dropbtn" :class="getTheme" @click="getSharableUrl">
                                <font-awesome-icon icon="share-square" @click="reveal"></font-awesome-icon>
                            </a>
                        </div>
                    </div>
                </div>

                <hr />
            </div>
            <div v-if="editing">
                <div class="container">
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
                                style="font-size: 12px; margin-left: 4px; float: right; position: absolute; cursor: pointer"
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
                </div>
                <div class="editorcontainer">
                    <MarkdownEditor
                        height="900px"
                        width="auto"
                        v-model="editContent"
                        :initialContent="editContent"
                        :title="editTitle"
                        :useHtml="true"
                    />
                    <div style="padding-top: 15px">
                        <a class="button" style="margin-right: 10px" @click="editing = false">Cancel</a>
                        <a class="button" :class="theme" @click="makeEdits">Submit Edit</a>
                    </div>
                </div>
            </div>
            <div v-else-if="editPostSettings">
                <div class="container">
                    <div class="row">
                        <div class="col">
                            <div class="row">
                                <div class="col">
                                    <p>Editable</p>
                                </div>
                                <div class="col">
                                    <toggle-button
                                        ref="editableTog"
                                        :sync="true"
                                        :value="editable"
                                    />
                                </div>
                            </div>
                            <div class="row">
                                <div class="col">
                                    <p>Comments Enabled</p>
                                </div>
                                <div class="col">
                                    <toggle-button
                                        ref="commentsEnabledTog"
                                        :sync="true"
                                        :value="commentsEnabled"
                                    />
                                </div>
                            </div>
                            <h3>Visibility Settings</h3>
                            <b-dropdown
                                style="margin-bottom: 10px;"
                                :variant="theme"
                                @click.stop
                                :text="visibility"
                            >
                                <b-dropdown-item @click.stop="visibility = 'public'">Public</b-dropdown-item>
                                <b-dropdown-item @click.stop="visibility = 'login_only'">Login Only</b-dropdown-item>
                                <b-dropdown-item @click.stop="visibility = 'private'">Private</b-dropdown-item>
                            </b-dropdown>
                        </div>
                        <div class="col"></div>
                    </div>
                    <div style="padding-top: 15px">
                        <a class="button" style="margin-right: 10px" @click="changeSettings">Cancel</a>
                        <a class="button" :class="theme" @click="submitSettings">Submit Settings</a>
                    </div>
                </div>
            </div>
            <div v-else>
                <div
                    class="betterscrollbar container"
                    style="word-wrap: break-word; overflow: auto;"
                    v-html="renderedContent"
                ></div>
                <div class="container">
                    <hr />
                    <h1>Comments</h1>
                    <a
                        v-if="isAuthenticated && commentsEnabled"
                        class="button"
                        :class="theme"
                        @click="showCommentPost"
                    >Comment</a>
                    <p v-else-if="!commentsEnabled">Commenting is Disabled.</p>
                    <p v-else>Log in to post a comment.</p>
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
                </div>
                <MarkdownEditor
                    class="editorcontainer"
                    v-if="postingComment"
                    height="300px"
                    width="auto"
                    style="padding-bottom: 15px"
                    v-model="commentContent"
                    :initialContent="commentContent"
                    :useHtml="false"
                />
                <div class="container">
                    <div v-if="postingComment">
                        <a
                            class="button"
                            style="margin-right: 10px"
                            @click="postingComment = false"
                        >Cancel</a>
                        <a class="button" :class="theme" @click="postComment">Submit Comment</a>
                    </div>
                </div>
                <div class="container">
                    <hr />
                    <Comment
                        v-for="comment in comments"
                        :key="comment.id"
                        :comment="comment"
                        :ownsPost="user === $store.state.username"
                        @replying="replyToComment"
                        :editPerms="editPerms"
                        :postingComment="postingComment"
                        :parent="false"
                    />
                    <b-button v-if="show" @click="load" :variant="theme">Load More Comments</b-button>
                    <p v-else-if="comments.length === 0">No comments found.</p>
                    <p v-else>All comments loaded.</p>
                </div>
            </div>
        </div>
        <div v-else-if="notFound === null" style="text-align: center">
            <div class="container">
                <LoadingAnimation></LoadingAnimation>
            </div>
        </div>
        <div v-else-if="notFound === true">
            <div class="container">
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
import { mdHtml, mdNoHtml } from "../mdparser"
import LoadingAnimation from "./LoadingAnimation.vue"
import MarkdownEditor from "./MarkdownEditor.vue"
import { ToggleButton } from "vue-js-toggle-button"
import { BDropdown, BDropdownItem, BButton } from "bootstrap-vue"

@Component({
    components: {
        Comment,
        LoadingAnimation,
        BButton,
        MarkdownEditor,
        ToggleButton,
        BDropdownItem,
        BDropdown
    }
})
export default class Post extends Vue {
    public $refs: {
        container: HTMLDivElement
        eContainer: HTMLDivElement
        editableTog: any
        commentsEnabledTog: any
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
    protected editable: boolean | null
    protected commentsEnabled: boolean | null
    protected editPostSettings: boolean
    protected isReply: boolean
    protected replyId: number | null
    protected revealBtns: boolean = false
    protected visibility: string | null
    protected token: string | undefined
    protected sharableUrl: string | null
    @Prop(String) protected readonly title!: string
    @Prop(String) protected readonly id!: string
    @Getter("getTheme") private getTheme: string
    @Getter("isAuthenticated") private isAuthenticated: boolean

    public refs = [
        "hamburgerMenu"
    ]

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
        this.editable = null
        this.commentsEnabled = null
        this.editPostSettings = false
        this.isReply = false
        this.replyId = null
        this.sharableUrl = null
        // TODO
        this.visibility = null
    }

    @Watch("content")
    protected renderContent() {
        this.renderedContent = mdHtml.render(this.content)
    }

    protected showCommentPost() {
        this.postingComment = !this.postingComment
        this.isReply = false
    }

    protected replyToComment(id) {
        this.postingComment = true
        this.isReply = true
        this.replyId = id
    }

    protected reveal() {
        this.revealBtns = !this.revealBtns
    }

    protected del() {
        this.revealBtns = false
        axios
            .post(
                `${process.env.VUE_APP_API_URL}/deletepost`,
                { id: this.id },
                { withCredentials: true }
            )
            .then((res) => {
                this.$store.dispatch("fetchPosts", 1)
                this.$store.dispatch("addAlert", {
                    alertType: "success",
                    alertText: res.data.success
                })
                this.$router.replace("/")
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
                this.$router.replace("/")
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
        this.revealBtns = false
        if (!this.editing) {
            this.postingComment = false
            this.editPostSettings = false
            this.editContent = this.content
            this.editTitle = this.header
            this.editing = true
        } else {
            this.editing = false
        }
    }

    protected changeSettings() {
        this.revealBtns = false
        if (!this.editPostSettings) {
            this.postingComment = false
            this.editing = false
            this.editContent = this.content
            this.editTitle = this.header
            this.editPostSettings = true
        } else {
            this.editPostSettings = false
        }
    }

    protected async submitSettings() {
        const editable = this.$refs.editableTog.toggled
        const commentsEnabled = this.$refs.commentsEnabledTog.toggled
        // endpoint to change settings
        try {
            const { data } = await axios.post(
                `${process.env.VUE_APP_API_URL}/editpost-settings`,
                {
                    id: this.id,
                    urlTitle: this.title,
                    editable,
                    commentsEnabled,
                    visibility: this.visibility
                },
                { withCredentials: true }
            )
            const msg = data.success
            this.$store.dispatch("addAlert", {
                alertType: "success",
                alertText: msg
            })
            this.editable = editable
            this.commentsEnabled = commentsEnabled
            this.changeSettings()
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

    protected async makeEdits() {
        try {
            const { data } = await axios.post(
                `${process.env.VUE_APP_API_URL}/editpost`,
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
                this.$router.replace(`/posts/${this.id}/${newUrlTitle}`)
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
                `${process.env.VUE_APP_API_URL}/comment`,
                {
                    id: this.id,
                    urlTitle: this.title,
                    content: this.commentContent,
                    replyId: this.isReply ? this.replyId : null
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

    protected mounted() {
        if (typeof (this.$route.query.token) === "string") {
            this.token = this.$route.query.token
        }
        this.fetchData()
    }

    protected async getSharableUrl() {
        this.revealBtns = false
        const { data } = await axios.post(
            `${process.env.VUE_APP_API_URL}/sharable-post-token`,
            { id: this.id },
            { withCredentials: true }
        )
        this.sharableUrl = data.success
    }

    protected async loadComments() {
        const { data }: { data: PostModel } = await axios.get(
            `${process.env.VUE_APP_API_URL}/post/${this.id}/${this.title}/${this.currentPage}`,
            { withCredentials: true }
        )
        this.commentCount = data.commentCount
        this.comments = []
        for (let i = 1; i <= this.currentPage; i++) {
            const comments = (await axios.get(
                `${process.env.VUE_APP_API_URL}/post/${this.id}/${this.title}/${i}`,
                { withCredentials: true }
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
                `${process.env.VUE_APP_API_URL}/post/${this.id}/${this.title}/${this.currentPage}?token=${this.token}`,
                { withCredentials: true }
            )
            this.header = data.title
            document.title = `${this.header} | Blog`
            this.content = data.content
            this.user = data.username
            this.pages = data.pages
            this.commentCount = data.commentCount
            this.tags = data.tags
            this.commentLimit = data.commentLimit
            this.commentLimitVal = data.commentLimitVal
            this.editPerms = data.requiredManagePerms
            this.editingTags = ""
            this.editable = data.editable
            this.commentsEnabled = data.commentsEnabled
            this.visibility = data.visibility
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
@import "../assets/sass/variables.sass"
@media screen and (min-width: 992px)
    .datapos
        display: inline-block
    .buttonpos
        position: absolute
        top: 0
        right: 0
    .dropmenu
        right: 0
        top: 30px
@media screen and (max-width: 992px)
    .datapos
        margin: 0 auto
        display: block
        margin-bottom: 15px
    .buttonpos
        position: relative
        display: block
.dropmenu
    position: absolute
    padding: 0px
    border-radius: 5px
    z-index: 2
.dropbtn
    display: block
    cursor: pointer
    width: 100%
    height: auto
    border-radius: 5px
    padding: 15px
.comment.light.condensed:hover
    background-color: $darkelehover !important
.comment.dark.condensed:hover
    background-color: $lightelehover !important
.comment::-webkit-scrollbar
    width: 10px
.comment::-webkit-scrollbar-thumb
    border-radius: 10px
    -webkit-box-shadow: inset 0 0 6px rgba(0,0,0,.3)
.comment::-webkit-scrollbar-track
    -webkit-box-shadow: inset 0 0 6px rgba(0,0,0,0.3)
.danger
    color: $red
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
    color: $red !important
.edit
    color: $green !important
.plainbtn
    cursor: pointer
    border-radius: 5px
    padding: 10px
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
.editorcontainer
    padding-right: 35px
    padding-left: 15px
    margin-left: auto
    margin-right: auto
@media (min-width: 1300px)
    .editorcontainer
        width: calc(100% - 100px)
.hashtag:hover
    cursor: pointer
.hamburger
    cursor: pointer
    webkit-transition: 0.5s
    transition: 0.5s
.hamburger:hover
    webkit-transition: 0.5s
    transition: 0.5s
.urlshare
    padding: 20px
    border-radius: 20px
    margin-bottom: 20px
.dark
    .button
        background-color: $darkfg !important
    .preview
        background-color: $darkfg !important
    .button
        background-color: $darkfg !important
    .title
        border-color: $darkbg !important
        background-color: $darkfg !important
    .metadata
        background-color: $darkfg !important
    .hashtag
        background-color: $darkhashtagbg !important
    .hashtag:hover
        color: $darkhover
    .hashtag-edit
        background-color: $darkhashtagbg !important
    .hashtag:hover
        color: $darkhover
    .hamburger:hover
        color: $darkhover
    .dropmenu
        background-color: $darkfg
        border: 1px solid $darkborder
    .dropdown-menu
        background-color: $darkfg
    .urlshare
        background-color: $darkfg
.light
    .preview
        background-color: $lightfg !important
    .button
        background-color: $lightfg !important
    .title
        border-color: $lightfg !important
        background-color: $lightfg !important
    .metadata
        background-color: $lightfg !important
    .hashtag
        background-color: $lighthashtagbg !important
    .hashtag:hover
        color: $lighthover
    .hashtag-edit
        background-color: $lightfg 
    .hashtag-edit:hover
        color: $lighthover
    .hamburger:hover
        color: $lighthover
    .dropmenu
        background-color: $lightfg
        border: 1px solid $lightborder
</style>
