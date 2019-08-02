<template>
    <div class="login">
        <label>Username</label>
        <br />
        <input v-model="username" type="text" />
        <br />
        <label>Password</label>
        <br />
        <input v-model="password" type="password" />
        <br />
        <button @click="authenticate">Login</button>
        <p v-if="failed">Authentication failed.</p>
    </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import PostBlock from "@/components/PostBlock.vue"; // @ is an alias to /src
import axios from "axios";
import { Action } from "vuex-class";

@Component
export default class Home extends Vue {
    @Action("login") protected login: any;
    @Action("logout") protected logout: any;
    protected username: string;
    protected password: string;
    protected failed: boolean;
    constructor() {
        super();
        this.username = "";
        this.password = "";
        this.failed = false;
    }

    protected authenticate() {
        axios.post(
            "http://localhost:3000/login",
            { username: this.username, password: this.password },
            { withCredentials: true }
        ).then((res) => {
            this.login();
            this.$router.push("/");
        }).catch(() => {
            this.logout();
            this.failed = true;
        });
    }
}
</script>

<style lang="sass" scoped>
</style>
