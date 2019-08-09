<template>
    <div class="profile">
        <!-- <p>Not implemented yet.</p> -->
        <div v-if="!notFound">
        <img :src="gravatarUrl">
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
import { Component, Vue, Prop } from "vue-property-decorator";
import axios from "axios";
import { State } from "vuex-class";
import moment from "moment";

@Component
export default class Profile extends Vue {
    @Prop(String) protected passedUser: string | null;
    protected user: string | null;
    protected gravatarUrl: string | null;
    protected createdAt: string | null;
    protected permissionLevel: string | null;
    protected age: string | null;
    protected notFound: boolean = false;

    constructor() {
        super();
        this.user = this.passedUser != null ? this.passedUser : null;
        this.gravatarUrl = null;
        this.createdAt = null;
        this.permissionLevel = null;
        this.age = null;
    }

    get theme() {
        return this.$store.getters.getTheme;
    }

    get username() {
        return this.$store.state.username;
    }

    protected async mounted() {
        try {
            if (this.user == null) {
                this.user = this.username;
            }
            const { data } = await axios.get(`http://localhost:3000/profile/${this.user}`);
            this.user = data.username;
            this.gravatarUrl = data.gravatarUrl;
            this.createdAt =  moment
                .utc(data.createdAt)
                .local()
                .format("MM/DD/YYYY, HH:mm");
            this.permissionLevel = data.permissionLevel;
            this.age = moment(data.createdAt).fromNow();
        } catch (__) {
            this.notFound = true;
        }
    }
}
</script>

<style lang="sass" scoped>
</style>
