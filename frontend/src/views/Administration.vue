<template>
    <div class="administration" :class="theme">
        <!-- I dont really know what to do for this. Maybe show users, posts, etc in paginated format?-->
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
                        style="margin-left: 10px; margin-right: 10px"
                    ></font-awesome-icon>
                    {{user.commentCount}}
                </div>
                <p>{{user.username}}</p>
                <p>{{user.email}}</p>
                <b-button v-if="username !== user.username" @click.stop="deleteUser(user)" :variant="theme">Delete User</b-button>
            </div>
        </div>  
        <b-button v-if="showUserButton" @click="getUsers" :variant="theme">Load More Users</b-button>
        <p v-else-if="users && users.length === 0">No users found.</p>
        <p v-else>All users loaded.</p>
    </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import PostBlock from "@/components/PostBlock.vue"; // @ is an alias to /src
import axios from "axios";
import { State } from "vuex-class";

@Component
export default class Administration extends Vue {
    protected userPages: number | null;
    protected userPageNum: number;
    protected users: any[];
    constructor() {
        super();
        this.userPageNum = 1;
        this.userPages = null;
        this.users = [];
    }

    protected mounted() {
        this.getAdminData();
    }

    get showUserButton() {
        return this.userPages < this.userPageNum;
    }

    get theme() {
        return this.$store.getters.getTheme;
    }

    get username() {
        return this.$store.state.username;
    }

    protected async deleteUser(user) {
        try {
            let { data } = await axios.post(
                `http://localhost:3000/admindeleteuser/${user.username}`,
                {},
                { withCredentials: true }
            );
            let index = this.users.findIndex(looking => looking.username === user.username);
            if (index) {
                this.users.splice(index, 1);
            }
            this.$store.dispatch("addAlert", {
                alerType: "success",
                alertText: data.success
            });
        } catch (err) {
            if (err.response) {
                this.$store.dispatch("addAlert", {
                    alerType: "danger",
                    alertText: err.response.data.error
                });
            } else {
                this.$store.dispatch("addAlert", {
                    alerType: "danger",
                    alertText: "There was a problem performing this action."
                });
            }
        }
    }

    protected gotoUser(username) {
        this.$router.push(`/profile/${username}`);
    }

    protected getAdminData() {
        this.getUsers();
    }

    protected async getUsers() {
        try {
            let { data } = await axios.get(
                `http://localhost:3000/administration/${this.userPageNum}`,
                { withCredentials: true }
            );
            if (this.userPageNum === 1) {
                this.userPages = data.pages;
                this.users = data.users;
                for (let user of this.users) {
                    user.alive = true;
                }
            } else {
                const users = data.users as Array<{
                    username: string;
                    email: string;
                    postCount: number;
                    commentCount: number;
                }>;
                for (let user of users) {
                    this.users.push(user);
                }
            }
        } catch (err) {
            this.$store.dispatch("addAlert", {
                alerType: "danger",
                alertText: "There was a problem getting users."
            });
        }
    }
}
</script>

<style lang="sass" scoped>
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
.dark
    .user
        background-color: #2a2c39
    .user:hover
        background-color: #3e4154
</style>
