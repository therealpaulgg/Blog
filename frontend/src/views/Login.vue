<template>
    <div class="login">
        <b-container>
            <b-row>
                <b-col lg="4">
                    <b-input-group size="sm" prepend="Username">
                        <b-form-input class="ifield" v-model="username" v-on:keyup.enter="authenticate"/>
                    </b-input-group>
                    <br />
                    <b-input-group size="sm" prepend="Password">
                        <b-form-input class="ifield" v-model="password" type="password" v-on:keyup.enter="authenticate" />
                    </b-input-group>
                    <br />
                    <b-input-group size="sm">
                        <b-button :variant="theme" @click="authenticate">Login</b-button>
                    </b-input-group>
                    <br>
                    <div>Forgot your password? <router-link to="/resetpasswordreq"><b>Click here to reset it.</b></router-link></div>
                    <!-- <g-signin-button
                        :params="googleSignInParams"
                        @success="gOauthSuccess"
                        @error="gOauthError"
                    >
                    </g-signin-button>-->
                    <!-- <div style="margin-top: 20px" class="g-signin2" data-onsuccess="onSignIn"></div> -->
                </b-col>
            </b-row>
        </b-container>
    </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator"
import axios from "axios"
import { Action } from "vuex-class"

import { determineTokenRefreshInterval } from "../loginfunc"
import {BRow, BCol, BContainer, BInputGroup, BFormInput, BButton} from "bootstrap-vue"
import { ws, connect, close } from "../websocket"

@Component({
    components: {
        BRow,
        BCol,
        BContainer,
        BInputGroup,
        BFormInput,
        BButton
    }
})
export default class Home extends Vue {
    @Action("login") protected login: any
    @Action("logout") protected logout: any
    protected username: string
    protected password: string
    protected googleSignInParams = {
        client_id:
            "270164016094-hu9876dvd5e3bkjq0lhpp6ne4uhmf6d8.apps.googleusercontent.com"
    }

    constructor() {
        super()
        this.username = ""
        this.password = ""
    }

    // maybe one day

    // protected gOauthSuccess() {
    // }

    // protected gOauthError() {
    // }

    // protected onSuccess() {
    // }

    protected get theme() {
        return this.$store.getters.getTheme
    }

    protected get isAuthenticated() {
        return this.$store.getters.isAuthenticated
    }

    protected mounted() {
        if (this.isAuthenticated) {
            this.$router.push("/")
        }
    }

    protected authenticate() {
        axios
            .post(
                `${process.env.VUE_APP_API_URL}/login`,
                { username: this.username, password: this.password },
                { withCredentials: true }
            )
            .then((res: any) => {
                this.$store.dispatch("setUsername", res.data.username)
                this.$store.dispatch("setAdmin", res.data.admin)
                this.$store.dispatch("setCanPost", res.data.canPost)
                this.login()
                this.$store.dispatch("addAlert", {
                        alertType: "success",
                        alertText: res.data.success
                    })
                determineTokenRefreshInterval()
                // connect()
                this.$router.push("/")
            })
            .catch((err) => {
                if (err.response != null) {
                    this.$store.dispatch("addAlert", {
                        alertType: "danger",
                        alertText: err.response.data.error
                    })
                } else {
                    this.$store.dispatch("addAlert", {
                        alertType: "danger",
                        alertText: "Incorrect username or password."
                    })
                }
            })
    }
}
</script>

<style lang="sass" scoped>
@import "../assets/sass/variables.sass"
.button
    border-radius: 5px
    padding: 10px
    cursor: pointer
.dark
    .button
        background-color: $darkfg !important
    .ifield
        border-color: $darkbg !important
        background-color: $darkfg !important
        color: white
.light
    .button
        background-color: white !important
    .ifield
        background-color: white
</style>
