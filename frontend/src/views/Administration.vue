<template>
    <div class="administration" :class="theme">
        <!-- I dont really know what to do for this. Maybe show users, posts, etc in paginated format?-->
        <div class="row">
            <div class="col">
                <h3>Settings</h3>
                <div class="row">
                    <div class="col">
                        <p>Limit Comment Length</p>
                    </div>
                    <div class="col">
                        <toggle-button
                            v-model="limitCommentLength"
                            :sync="true"
                            :value="limitCommentLength"
                        />
                    </div>
                </div>
                <div class="row">
                    <div class="col">
                        <p>Comment Max Length</p>
                    </div>
                    <div class="col">
                        <b-input-group size="sm">
                            <b-form-input class="ifield" v-model="commentMaxLength" />
                        </b-input-group>
                    </div>
                </div>
                <div class="row">
                    <div class="col">
                        <p>Limit Post Title Length</p>
                    </div>
                    <div class="col">
                        <toggle-button
                            v-model="limitPostTitleLength"
                            :sync="true"
                            :value="limitPostTitleLength"
                        />
                    </div>
                </div>
                <div class="row">
                    <div class="col">
                        <p>Post Title Max Length</p>
                    </div>
                    <div class="col">
                        <b-input-group size="sm">
                            <b-form-input class="ifield" v-model="postTitleMaxLength" />
                        </b-input-group>
                    </div>
                </div>
                <div class="row">
                    <div class="col">
                        <p>Enable Registration</p>
                    </div>
                    <div class="col">
                        <toggle-button
                            v-model="registrationEnabled"
                            :sync="true"
                            :value="registrationEnabled"
                        />
                    </div>
                </div>
                <b-button :variant="theme" @click="saveSettings">Save Settings</b-button>
            </div>
            <div class="col">
                <h3>Users</h3>
                <div
                    class="user"
                    v-for="user in users"
                    :key="user.username"
                    @click="gotoUser(user.username)"
                >
                    <div>
                        <div style="float: right">
                            <font-awesome-icon icon="clipboard" style="margin-right: 10px"></font-awesome-icon>
                            {{user.postCount}}
                            <font-awesome-icon
                                icon="comments"
                                style="margin-left: 10px margin-right: 10px"
                            ></font-awesome-icon>
                            {{user.commentCount}}
                        </div>
                        <p>{{user.username}}</p>
                        <p>{{user.email}}</p>
                        <div v-if="user.permissionLevel === 'normal'">
                            <font-awesome-icon icon="user"></font-awesome-icon>
                            <p>Normal</p>
                        </div>
                        <div v-else-if="user.permissionLevel === 'author'">
                            <font-awesome-icon icon="user-edit"></font-awesome-icon>
                            <p>Author</p>
                        </div>
                        <div v-else-if="user.permissionLevel === 'moderator'">
                            <font-awesome-icon icon="users-cog"></font-awesome-icon>
                            <p>Moderator</p>
                        </div>
                        <div v-else-if="user.permissionLevel === 'superadmin'">
                            <font-awesome-icon icon="user-shield"></font-awesome-icon>
                            <p>Super Admin</p>
                        </div>
                        <div v-else>
                            <font-awesome-icon icon="user-secret"></font-awesome-icon>
                            <p>Secret Role</p>
                        </div>
                        <b-dropdown
                            style="margin-bottom: 10px"
                            :variant="theme"
                            v-if="user.username !== username"
                            @click.stop
                            :text="user.permissionLevel"
                        >
                            <b-dropdown-item
                                @click.stop="user.permissionLevel = 'superadmin'"
                            >Super Admin</b-dropdown-item>
                            <b-dropdown-item
                                @click.stop="user.permissionLevel = 'moderator'"
                            >Moderator</b-dropdown-item>
                            <b-dropdown-item @click.stop="user.permissionLevel = 'author'">Author</b-dropdown-item>
                            <b-dropdown-item @click.stop="user.permissionLevel = 'normal'">Normal</b-dropdown-item>
                        </b-dropdown>
                        <div v-if="user.initialPermissionLevel !== user.permissionLevel">
                            <b-button
                                style="margin-bottom: 10px"
                                @click.stop="updatePerms(user)"
                                :variant="theme"
                            >Save Changes</b-button>
                        </div>
                        <div>
                            <b-button
                                v-if="username !== user.username"
                                @click.stop="deleteUser(user)"
                                :variant="theme"
                            >Delete User</b-button>
                        </div>
                    </div>
                </div>
                <b-button v-if="showUserButton" @click="getUsers" :variant="theme">Load More Users</b-button>
                <p v-else-if="users && users.length === 0">No users found.</p>
                <p v-else>All users loaded.</p>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator"
import PostBlock from "@/components/PostBlock.vue" // @ is an alias to /src
import axios from "axios"
import { State } from "vuex-class"
import { ToggleButton } from "vue-js-toggle-button"
import config from "../config"

@Component({
    components: {
        ToggleButton
    }
})
export default class Administration extends Vue {
    protected userPages: number | null
    protected userPageNum: number
    protected users: any[]
    protected limitCommentLength: boolean | null
    protected commentMaxLength: number | null
    protected limitPostTitleLength: boolean | null
    protected postTitleMaxLength: number | null
    protected registrationEnabled: boolean | null
    constructor() {
        super()
        this.userPageNum = 1
        this.userPages = null
        this.users = []
        this.limitCommentLength = null
        this.commentMaxLength = null
        this.limitPostTitleLength = null
        this.postTitleMaxLength = null
        this.registrationEnabled = null
    }

    protected mounted() {
        this.getAdminData()
    }

    get showUserButton() {
        return this.userPages < this.userPageNum
    }

    get theme() {
        return this.$store.getters.getTheme
    }

    get username() {
        return this.$store.state.username
    }

    protected async deleteUser(user) {
        try {
            let { data } = await axios.post(
                `${config.apiUrl}/admindeleteuser/${user.username}`,
                {},
                { withCredentials: true }
            )
            let index = this.users.findIndex(
                looking => looking.username === user.username
            )
            if (index) {
                this.users.splice(index, 1)
            }
            this.$store.dispatch("addAlert", {
                alerType: "success",
                alertText: data.success
            })
        } catch (err) {
            if (err.response) {
                this.$store.dispatch("addAlert", {
                    alerType: "danger",
                    alertText: err.response.data.error
                })
            } else {
                this.$store.dispatch("addAlert", {
                    alerType: "danger",
                    alertText: "There was a problem performing this action."
                })
            }
        }
    }

    protected gotoUser(username) {
        this.$router.push(`/profile/${username}`)
    }

    protected getAdminData() {
        this.getUsers()
        this.getSettings()
    }

    protected async updatePerms(user) {
        console.log("mememem")
        try {
            let { data } = await axios.post(
                `${config.apiUrl}/setuserpermissions`,
                {
                    username: user.username,
                    permissionLevel: user.permissionLevel
                },
                { withCredentials: true }
            )
            this.$store.dispatch("addAlert", {
                alerType: "success",
                alertText: data.success
            })
            user.initialPermissionLevel = user.permissionLevel
        } catch (err) {
            if (err.response) {
                this.$store.dispatch("addAlert", {
                    alerType: "danger",
                    alertText: err.response.data.error
                })
            } else {
                this.$store.dispatch("addAlert", {
                    alerType: "danger",
                    alertText: "There was a problem updating permissions."
                })
            }
        }
    }

    protected async saveSettings() {
        try {
            let { data } = await axios.post(
                `${config.apiUrl}/settingdata`,
                {
                    limitCommentLength: this.limitCommentLength,
                    commentMaxLength: this.commentMaxLength,
                    limitPostTitleLength: this.limitPostTitleLength,
                    postTitleMaxLength: this.postTitleMaxLength,
                    registrationEnabled: this.registrationEnabled
                },
                { withCredentials: true }
            )
            this.$store.dispatch("addAlert", {
                alerType: "success",
                alertText: data.success
            })
        } catch (err) {
            if (err.response) {
                this.$store.dispatch("addAlert", {
                    alerType: "danger",
                    alertText: err.response.data.error
                })
            } else {
                this.$store.dispatch("addAlert", {
                    alerType: "danger",
                    alertText: "There was a problem saving your settings."
                })
            }
        }
    }

    protected async getSettings() {
        try {
            let { data } = await axios.get(
                `${config.apiUrl}/settingdata`,
                { withCredentials: true }
            )
            this.limitCommentLength = data.limitCommentLength
            this.commentMaxLength = data.commentMaxLength
            this.limitPostTitleLength = data.limitPostTitleLength
            this.postTitleMaxLength = data.postTitleMaxLength
            this.registrationEnabled = data.registrationEnabled
        } catch (err) {
            this.$store.dispatch("addAlert", {
                alerType: "danger",
                alertText: "There was a problem getting some admin data."
            })
        }
    }

    protected async getUsers() {
        try {
            let { data } = await axios.get(
                `${config.apiUrl}/administration/${this.userPageNum}`,
                { withCredentials: true }
            )
            if (this.userPageNum === 1) {
                this.userPages = data.pages
                this.users = []
            }
            let users = data.users as Array<{
                username: string
                email: string
                postCount: number
                commentCount: number
                permissionLevel: string
                initialPermissionLevel: string | undefined
            }>
            for (let user of users) {
                user.initialPermissionLevel = user.permissionLevel
                this.users.push(user)
            }
        } catch (err) {
            this.$store.dispatch("addAlert", {
                alerType: "danger",
                alertText: "There was a problem getting some admin data."
            })
        }
    }
}
</script>

<style lang="sass">
.user
    padding: 10px
    margin: 10px
    border-radius: 10px
    transition: 0.5s
    -webkit-transition: 0.5s
.user:hover
    border-radius: 30px
    transition: 0.5s
    -webkit-transition: 0.5s
    cursor: pointer
.light
    .user
        background-color: white
    .user:hover
        background-color: #f2feff
    .ifield
        background-color: white
.dark
    .dropdown-menu
        background-color: black 
    .user
        background-color: #2a2c39
    .user:hover
        background-color: #3e4154
    .ifield
        border-color: #20212B !important
        background-color: #2a2c39 !important
        color: white
</style>
