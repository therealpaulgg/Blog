<template>
    <div class="profile">
        <!-- <p>Not implemented yet.</p> -->
        <div v-if="notFound === false">
            <div class="row">
                <div class="col">
                    <img :src="gravatarUrl" />
                    <h3>{{user}}</h3>
                    <p>Registered on {{createdAt}}, {{age}}</p>
                    <!-- have an icon for administrator, moderator, author, or regular user -->
                    <div v-if="permissionLevel === 'normal'">
                        <font-awesome-icon icon="user"></font-awesome-icon>
                        <p>Normal</p>
                    </div>
                    <div v-else-if="permissionLevel === 'author'">
                        <font-awesome-icon icon="user-edit"></font-awesome-icon>
                        <p>{{permissionLevel}}</p>
                    </div>
                    <div v-else-if="permissionLevel === 'moderator'">
                        <font-awesome-icon icon="users-cog"></font-awesome-icon>
                        <p>Moderator</p>
                    </div>
                    <div v-else-if="permissionLevel === 'superadmin'">
                        <font-awesome-icon icon="user-shield"></font-awesome-icon>
                        <p>Super Admin</p>
                    </div>
                    <div v-else>
                        <font-awesome-icon icon="user-secret"></font-awesome-icon>
                        <p>Secret Role</p>
                    </div>
                    <div v-if="bio">
                        <h2>Bio</h2>
                        <p>{{bio}}</p>
                    </div>
                    <b-button
                        v-if="!editing && user === username"
                        :variant="theme"
                        @click="editBio"
                        style="margin-bottom: 10px"
                    >Edit Bio</b-button>
                    <div v-if="editing">
                        <textarea
                            rows="5"
                            cols="30"
                            style="margin-bottom: 10px"
                            class="input"
                            :class="theme"
                            v-model="bio"
                        ></textarea>
                        <br />
                        <b-button
                            :variant="theme"
                            @click="editBio"
                            style="margin-right: 10px"
                        >Cancel</b-button>
                        <b-button :variant="theme" @click="submitBio">Submit</b-button>
                    </div>
                    <br />
                    <div v-if="!changingPassword && !changingEmail && user === username">
                        <b-button
                            :variant="theme"
                            style="margin-bottom: 10px"
                            @click="changePassword"
                        >Change Password</b-button>
                        <br />
                        <b-button :variant="theme" @click="changeEmail">Change Email</b-button>
                    </div>

                    <div v-if="changingEmail">
                        <b-input-group size="sm" prepend="Email" style="margin-bottom: 10px">
                            <b-form-input
                                class="ifield"
                                v-model="email"
                                type="email"
                                v-on:keyup.enter="submitEmailChange"
                            />
                        </b-input-group>
                        <b-button :variant="theme" @click="cancel" style="margin-right: 10px">Cancel</b-button>
                        <b-button @click="submitEmailChange" :variant="theme">Submit</b-button>
                    </div>
                    <div v-if="changingPassword">
                        <b-input-group size="sm" prepend="Old Password">
                            <b-form-input
                                class="ifield"
                                v-model="oldPassword"
                                type="password"
                                v-on:keyup.enter="submitPasswordChange"
                            />
                        </b-input-group>
                        <br />
                        <b-input-group size="sm" prepend="Password">
                            <b-form-input
                                class="ifield"
                                v-model="password"
                                type="password"
                                v-on:keyup.enter="submitPasswordChange"
                            />
                        </b-input-group>
                        <br />
                        <b-input-group
                            size="sm"
                            prepend="Confirm Password"
                            style="margin-bottom: 10px"
                        >
                            <b-form-input
                                class="ifield"
                                v-model="confirmPassword"
                                type="password"
                                v-on:keyup.enter="submitPasswordChange"
                            />
                        </b-input-group>

                        <b-button :variant="theme" @click="cancel" style="margin-right: 10px">Cancel</b-button>
                        <b-button @click="submitPasswordChange" :variant="theme">Submit</b-button>
                    </div>
                </div>
                <div class="col">
                    <h1 style="text-align: center">Posts</h1>
                    <div v-if="posts !== null">
                        <PostBlock
                            v-for="post in posts"
                            :key="post.postId"
                            :title="post.title"
                            :content="post.content"
                            :urlTitle="post.urlTitle"
                            :createdAt="post.createdAt"
                            :updatedAt="post.updatedAt"
                            :id="post.postId"
                            :author="post.username"
                            :tags="post.tags"
                            :condensed="true"
                        ></PostBlock>
                        <b-button
                            v-if="showPostBtn"
                            @click="loadPosts"
                            :variant="theme"
                        >Load More Posts</b-button>
                        <p v-else-if="posts && posts.length === 0">No posts found.</p>
                        <p v-else>All posts loaded.</p>
                    </div>
                    <div v-else-if="postLoadingFailed">
                        <p>Posts failed to load.</p>
                    </div>
                    <div v-else style="text-align: center">
                        <LoadingAnimation></LoadingAnimation>
                    </div>
                </div>
                <div class="col">
                    <h1 style="text-align: center">Comments</h1>
                    <div v-if="comments !== null">
                        <Comment
                            v-for="comment in comments"
                            :key="comment.id"
                            :comment="comment"
                            :ownsPost="false"
                            :condensed="true"
                        />
                        <b-button
                            v-if="showCommentBtn"
                            @click="loadComments"
                            :variant="theme"
                        >Load More Comments</b-button>
                        <p v-else-if="comments && comments.length === 0">No comments found.</p>
                        <p v-else>All comments loaded.</p>
                    </div>
                    <div v-else-if="commentLoadingFailed">
                        <p>Comments failed to load.</p>
                    </div>
                    <div v-else style="text-align: center">
                        <LoadingAnimation></LoadingAnimation>
                    </div>
                </div>
            </div>
        </div>
        <div v-else-if="notFound === null" style="text-align: center">
            <LoadingAnimation></LoadingAnimation>
        </div>
        <div v-else>
            <h1>User '{{user}}' not found.</h1>
        </div>

        <!-- number of user comments -->
        <!-- if the user can post, return number of user posts -->
        <!-- 
            if the authenticated user is an admin/mod, 
        provide admin options to delete account w/o banning, 
        shadow ban (ip, username, email banned in DB, cannot log in to see alert because account is deleted (or just shadowBan = true)),
        formal ban (ip, username, email banned in DB, can log in to see their account is banned (ban = true)) 
        show if user has been verified w/ email
        -->
        <!-- add option to report users (hide this if admin) -->
    </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from "vue-property-decorator"
import axios from "axios"
import { State } from "vuex-class"
import moment from "moment"
import PostBlock from "../components/PostBlock.vue"
import Comment from "../components/Comment.vue"
import { PostModel } from "../models/post"
import { CommentModel } from "../models/comment"
import config from "../config"
import LoadingAnimation from "../components/LoadingAnimation.vue"

@Component({
    components: {
        PostBlock,
        Comment,
        LoadingAnimation
    }
})
export default class Profile extends Vue {
    @Prop(String) protected passedUser: string | null
    protected user: string | null
    protected gravatarUrl: string | null
    protected createdAt: string | null
    protected permissionLevel: string | null
    protected age: string | null
    protected bio: string | null
    protected notFound: boolean = null
    protected editing: boolean = false
    protected postPage: number = 1
    protected commentPage: number = 1
    protected posts: PostModel[]
    protected postLoadingFailed: boolean = false
    protected comments: CommentModel[]
    protected commentLoadingFailed: boolean = false
    protected postPages: number | null
    protected commentPages: number | null
    protected changingPassword: boolean = false
    protected changingEmail: boolean = false
    protected password: string = ""
    protected confirmPassword: string = ""
    protected email: string = ""
    protected oldPassword: string = ""

    constructor() {
        super()
        this.user = this.passedUser != null ? this.passedUser : null
        this.gravatarUrl = null
        this.createdAt = null
        this.permissionLevel = null
        this.age = null
        this.bio = null
        this.posts = null
        this.comments = null
        this.postPages = null
        this.commentPages = null
    }

    protected editBio() {
        this.editing = !this.editing
    }

    get theme() {
        return this.$store.getters.getTheme
    }

    get username() {
        return this.$store.state.username
    }

    get showPostBtn() {
        return this.postPages > this.postPage
    }

    get showCommentBtn() {
        return this.commentPages > this.commentPage
    }

    protected loadPosts() {
        this.postPage += 1
        this.postData()
    }

    protected loadComments() {
        this.commentPage += 1
        this.commentData()
    }

    protected changePassword() {
        this.changingPassword = true
    }

    protected changeEmail() {
        this.changingEmail = true
    }

    protected cancel() {
        if (this.changingEmail) {
            this.changingEmail = false
        } else if (this.changingPassword) {
            this.changingPassword = false
        }
    }

    protected async submitEmailChange() {
        try {
            const { data } = await axios.post(
                `${config.apiUrl}/changeemail`,
                { email: this.email },
                { withCredentials: true }
            )
            this.$store.dispatch("addAlert", {
                alertType: "success",
                alertText: data.success
            })
            this.changingEmail = false
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

    protected async submitPasswordChange() {
        if (this.password === this.confirmPassword) {
            try {
                const { data } = await axios.post(
                    `${config.apiUrl}/changepassword`,
                    {
                        username: this.username,
                        password: this.password,
                        oldPassword: this.oldPassword
                    },
                    { withCredentials: true }
                )
                this.$store.dispatch("addAlert", {
                    alertType: "success",
                    alertText: data.success
                })
                this.changingPassword = false
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
        } else {
            this.$store.dispatch("addAlert", {
                alertType: "danger",
                alertText: "Your passwords do not match."
            })
        }
    }

    protected async submitBio() {
        try {
            const { data } = await axios.post(
                `${config.apiUrl}/updatebio`,
                {
                    bio: this.bio,
                    username: this.username
                },
                { withCredentials: true }
            )
            this.editing = false
            this.$store.dispatch("addAlert", {
                alertType: "success",
                alertText: data.success
            })
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

    protected async mounted() {
        await this.profileData()
        if (!this.notFound) {
            this.postData()
            this.commentData()
        }
    }

    protected async postData() {
        try {
            this.postLoadingFailed = false
            const { data } = await axios.get(
                `${config.apiUrl}/userposts/${this.user}/${this.postPage}`
            )
            if (this.postPage === 1) {
                this.postPages = data.pages
                this.posts = data.posts
            } else {
                const posts = data.posts as PostModel[]
                for (const post of posts) {
                    this.posts.push(post)
                }
            }
        } catch {
            this.postLoadingFailed = true
        }
    }

    protected async commentData() {
        try {
            this.commentLoadingFailed = false
            const { data } = await axios.get(
                `${config.apiUrl}/usercomments/${this.user}/${this.postPage}`
            )
            if (this.commentPage === 1) {
                this.commentPages = data.pages
                this.comments = data.comments
            } else {
                const comments = data.comments as CommentModel[]
                for (const comment of comments) {
                    this.comments.push(comment)
                }
            }
        } catch {
            this.commentLoadingFailed = true
        }
    }

    protected async profileData() {
        try {
            if (this.user == null) {
                this.user = this.username
            }
            const { data } = await axios.get(
                `${config.apiUrl}/profile/${this.user}`
            )
            this.user = data.username
            document.title = `${this.user} | Blog`
            this.gravatarUrl = data.gravatarUrl
            this.createdAt = moment
                .utc(data.createdAt)
                .local()
                .format("MM/DD/YYYY, HH:mm")
            this.permissionLevel = data.permissionLevel
            this.age = moment(data.createdAt).fromNow()
            this.bio = data.bio
            this.notFound = false
        } catch {
            this.notFound = true
        }
    }
}
</script>

<style lang="sass" scoped>
.input
    transition: 0.5s
    -webkit-transition: 0.5s
    box-shadow: 0px 0px 5px black !important
.input.dark
    background-color: #2a2c39 !important
    border-color: #2a2c39
</style>
