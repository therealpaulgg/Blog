<template>
    <div
        :class="{'commentwrapper': !parent && !condensed, 'bigwrapper': replies != null}"
        v-if="alive"
    >
        <div
            class="comment"
            :class="{'light': getTheme === 'light', 'dark': getTheme === 'dark', 'condensed': condensed, 'commentthread': replies != null || parent, 'noverflow': parent}"
            @click="gotoPost(comment.postId, comment.postUrlTitle)"
        >
            <div class="metadata">
                <div style="position: relative">
                    <div class="datapos">
                        <span class="metaelement" v-if="comment != null && !condensed">
                            By:
                            <b>
                                <router-link
                                    :to="`/profile/${comment.user}`"
                                    v-if="comment.user !== '[deleted]'"
                                >{{comment.user}}</router-link>
                                <span v-else>{{comment.user}}</span>
                            </b>
                        </span>
                        <span class="metaelement">
                            <font-awesome-icon icon="calendar-alt"></font-awesome-icon>
                            <span class="metaelement">
                                {{date}},
                                <i>{{timeSince}}</i>
                            </span>
                        </span>
                        <span class="metaelement" v-if="comment.repliesCount">
                            <font-awesome-icon icon="comments"></font-awesome-icon>
                            {{comment.repliesCount}}
                        </span>
                    </div>

                    <div
                        class="buttonpos"
                        v-if="comment != null && !condensed && ($store.state.username === comment.user || editPerms || ownsPost)"
                    >
                        <font-awesome-icon icon="ellipsis-h" class="hamburger" @click="reveal" ref="hamburgerMenu"></font-awesome-icon>
                    </div>
                    <div
                        class="dropmenu"
                        v-if="revealBtns"
                        v-closable="{
                                handler: 'reveal',
                                exclude: refs
                            }"
                    >
                        <a
                            @click="replying(undefined)"
                            v-if="!postingComment && comment.user !== '[deleted]'"
                            class="dropbtn"
                        >Reply</a>
                        <a
                            @click="deleteComment"
                            v-if="comment.user !== '[deleted]'"
                            class="dropbtn delete"
                        >Delete</a>
                    </div>
                </div>
            </div>
            <div style="word-wrap: break-word" v-html="renderedContent"></div>
            <b-button
                @click="getReplies"
                v-if="comment.replies && replies == null"
                :variant="getTheme"
            >Show Replies</b-button>
            <comment
                @replying="replying"
                v-for="reply in replies"
                :key="reply.id"
                :comment="reply"
                :ownsPost="ownsPost"
                :editPerms="editPerms"
                :condensed="condensed"
                :postingComment="postingComment"
                :parent="true"
                @hide="determineHide"
            />
        </div>
    </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from "vue-property-decorator"
import { Getter } from "vuex-class"
import { CommentModel } from "../models/comment"
import moment from "moment"
import { mdNoHtml } from "../mdparser"
import axios from "axios"
import { BButton } from "bootstrap-vue"

interface ChildComponent extends Vue {
    alive: boolean
}

@Component({
    name: "comment",
    components: {
        BButton
    }
})
export default class Comment extends Vue {
    @Prop() protected comment: CommentModel
    @Prop() protected ownsPost: boolean
    @Prop() protected condensed: boolean
    @Prop() protected editPerms: boolean
    @Prop() protected postingComment: boolean
    @Prop() protected parent: boolean
    protected alive: boolean
    protected renderedContent: string
    protected replies: CommentModel[] | null
    protected revealBtns: boolean = false
    @Getter("getTheme") private getTheme: string

    public refs = [
        "hamburgerMenu"
    ]

    constructor() {
        super()
        this.alive = true
        this.replies = null
        this.renderedContent =
            this.comment != null ? mdNoHtml.render(this.comment.content) : null
    }

    get date() {
        return this.comment
            ? moment
                .utc(this.comment.createdAt)
                .local()
                .format("MM/DD/YYYY, HH:mm")
            : null
    }

    @Watch("comment.content")
    protected updateContent(newVal, oldVal) {
        this.renderedContent = mdNoHtml.render(newVal)
    }

    get timeSince() {
        return this.comment ? moment(this.comment.createdAt).fromNow() : null
    }

    protected async getReplies() {
        try {
            const { data }: { data: CommentModel[] } =
                await axios.get(`${process.env.VUE_APP_API_URL}/commentreplies/${this.comment.id}/1`)
            this.replies = data
        } catch {
            this.$store.dispatch("addAlert", {
                alertType: "danger",
                alertText: "Something went wrong."
            })
        }
    }

    protected determineHide(id) {
        if (this.replies != null) {
            const index = this.replies.indexOf(this.replies.find((comment) => comment.id === id))

            Vue.delete(this.replies, index)
            if (this.replies.length === 0) {
                this.replies = null
                this.comment.replies = false
            }
        }
        if (this.comment.content === "[deleted]" && this.comment.user === "[deleted]") {
            const child = this.$children.find((cChild: ChildComponent) => cChild.alive === true)
            if (child == null) {
                this.alive = false
                this.$emit("hide", this.comment.id)
            }
        }
    }

    protected gotoPost(id, urlTitle) {
        if (this.condensed) {
            this.$router.push(`/posts/${id}/${urlTitle}`)
        }
    }

    protected replying(id) {
        if (id !== undefined) {
            this.$emit("replying", id)
        } else {
            this.$emit("replying", this.comment.id)
        }

    }

    protected reveal() {
        this.revealBtns = !this.revealBtns
    }

    protected async deleteComment() {
        try {
            const { data } = await axios.post(
                `${process.env.VUE_APP_API_URL}/deletecomment`,
                { id: this.comment.id },
                { withCredentials: true }
            )
            this.$store.dispatch("addAlert", {
                alertType: "success",
                alertText: data.success
            })
            if (this.replies != null) {
                this.comment.user = "[deleted]"
                this.comment.content = "[deleted]"
            } else {
                this.alive = false
                this.$emit("hide", this.comment.id)
            }

        } catch (err) {
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
.dropbtn
    display: block
    cursor: pointer
    width: 100%
    height: auto
    border-radius: 5px
    padding: 15px
.dropmenu
    position: absolute
    padding: 0px
    border-radius: 5px
.delete
    color: $red !important
.metadata
    border-radius: 20px
    padding: 10px
    margin-bottom: 10px
.metaelement
    margin-left: 10px
    margin-right: 10px
.noverflow
    max-height: none !important
    margin-bottom: 0px
.comment
    margin-bottom: 20px
.commentthread
    border-top-left-radius: 0px
    border-bottom-left-radius: 0px
    padding-left: 20px
.commentthread.dark
    border-left: thick solid $lightcommentbar
.commentthread.light
    border-left: thick solid $darkcommentbar
.comment.condensed
    padding: 10px 10px 0px 10px
    max-width: 350px
    padding-top: 20px
    margin-bottom: 20px
    margin-top: 20px
    border-radius: 10px
    max-height: 300px
    overflow-y: auto
    width: 100%
    padding-left: 20px
.comment.condensed:hover
    border-radius: 20px
    transition: 0.5s
    -webkit-transition: 0.5s
    cursor: pointer
.comment.light.condensed:hover
    background-color: $lightelehover !important
.comment.dark.condensed:hover
    background-color: $darkelehover !important
.comment::-webkit-scrollbar
    width: 10px
.comment::-webkit-scrollbar-thumb
    border-radius: 10px
    -webkit-box-shadow: inset 0 0 6px rgba(0,0,0,.3)
.comment::-webkit-scrollbar-track
    -webkit-box-shadow: inset 0 0 6px rgba(0,0,0,0.3)
.commentwrapper
    padding: 20px
    border-radius: 20px
    padding-top: 20px
    margin-bottom: 20px
    margin-top: 20px
    border-radius: 10px
    max-height: 300px
    overflow-y: auto
    width: 100%
    padding-left: 20px
.bigwrapper
    max-height: 800px
.commentwrapper::-webkit-scrollbar
    width: 10px
.commentwrapper::-webkit-scrollbar-thumb
    border-radius: 10px
    -webkit-box-shadow: inset 0 0 6px rgba(0,0,0,.3)
.commentwrapper::-webkit-scrollbar-track
    -webkit-box-shadow: inset 0 0 6px rgba(0,0,0,0.3)
.hamburger
    cursor: pointer
    webkit-transition: 0.5s
    transition: 0.5s
.hamburger:hover
    webkit-transition: 0.5s
    transition: 0.5s
.dark
    background-color: $darkfg !important
    color: $darktext
    .commentwrapper
        background-color: $darkfg !important
        color: $darktext
    .commentwrapper::-webkit-scrollbar-thumb
        background-color: $darkscroll
    .comment::-webkit-scrollbar-thumb
        background-color: $darkscroll
    .metadata
        background-color: $darkbg !important
    .hamburger:hover
        color: $darkhover
    .dropmenu
        background-color: $darkfg
        border: 1px solid $darkborder
.light
    background-color: $lightfg !important
    color: $lighttext
    .commentwrapper
        background-color: $lightfg !important
        color: $lighttext
    .commentwrapper::-webkit-scrollbar-thumb
        background-color: $lightcommentbar
    .comment::-webkit-scrollbar-thumb
        background-color: $lightcommentbar
    .metadata
        background-color: $lightbg !important
    .hamburger:hover
        color: $lighthover
    .dropmenu
        background-color: $lightfg
        border: 1px solid $lightborder
</style>
