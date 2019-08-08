<template>
    <div class="login">
        <b-container>
            <b-row>
                <b-col lg="4">
                    <b-input-group size="sm" prepend="Username">
                        <b-form-input class="ifield" v-model="username" />
                    </b-input-group>
                    <br />
                    <b-input-group size="sm" prepend="Email">
                        <b-form-input class="ifield" v-model="email" type="email" />
                    </b-input-group>
                    <br />
                    <b-input-group size="sm" prepend="Password">
                        <b-form-input class="ifield" v-model="password" type="password" />
                    </b-input-group>
                    <br />
                    <b-input-group size="sm" prepend="Confirm Password">
                        <b-form-input class="ifield" v-model="confirmPassword" type="password" />
                    </b-input-group>
                    <br />
                    <b-input-group size="sm">
                        <b-button :variant="theme" @click="register">Register</b-button>
                    </b-input-group>
                </b-col>
            </b-row>
        </b-container>
    </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import PostBlock from "@/components/PostBlock.vue"; // @ is an alias to /src
import axios from "axios";
import { Action } from "vuex-class";

@Component
export default class Register extends Vue {
    @Action("login") protected login: any;
    @Action("logout") protected logout: any;
    protected username: string;
    protected email: string;
    protected password: string;
    protected confirmPassword: string;
    constructor() {
        super();
        this.username = "";
        this.email = "";
        this.password = "";
        this.confirmPassword = "";
    }

    protected get theme() {
        return this.$store.getters.getTheme;
    }

    protected async register() {
        try {
            await axios.post(
                "http://localhost:3000/register",
                {
                    username: this.username,
                    email: this.email,
                    password: this.password
                },
                { withCredentials: true }
            );
        } catch {
            this.$store.dispatch("addAlert", {
                alertType: "danger",
                alertText:
                    "There was a problem with registration. Please try again."
            });
        }
        try {
            let { data} = await axios.post(
                "http://localhost:3000/login",
                { username: this.username, password: this.password },
                { withCredentials: true }
            );
            this.$store.dispatch("setUsername", data.username);
                this.$store.dispatch("setAdmin", data.admin);
                this.$store.dispatch("setCanPost", data.canPost);
            this.login(true);
            this.$router.push("/");
        } catch {
            this.$store.dispatch("addAlert", {
                alertType: "danger",
                alertText:
                    "There was a problem logging in automatically. Please log in manually."
            });
        }
    }
}
</script>

<style lang="sass" scoped>
.button
    border-radius: 5px
    padding: 10px
    cursor: pointer
.dark
    .button
        background-color: #2a2c39 !important
    .ifield
        border-color: #20212B !important
        background-color: #2a2c39 !important
        color: white
.light
    .button
        background-color: white !important
    .ifield
        background-color: white
</style>
