<template>
    <div class="login">
        <b-container>
            <b-row>
                <b-col lg="4">
                    <b-input-group size="sm" prepend="Username">
                        <b-form-input
                            class="ifield"
                            v-model="username"
                            v-on:keyup.enter="register"
                        />
                    </b-input-group>
                    <br />
                    <b-input-group size="sm" prepend="Email">
                        <b-form-input
                            class="ifield"
                            v-model="email"
                            type="email"
                            v-on:keyup.enter="register"
                        />
                    </b-input-group>
                    <br />
                    <b-input-group size="sm" prepend="Password">
                        <b-form-input
                            class="ifield"
                            v-model="password"
                            type="password"
                            v-on:keyup.enter="register"
                        />
                    </b-input-group>
                    <br />
                    <b-input-group size="sm" prepend="Confirm Password">
                        <b-form-input
                            class="ifield"
                            v-model="confirmPassword"
                            type="password"
                            v-on:keyup.enter="register"
                        />
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
import { Component, Vue } from "vue-property-decorator"
import axios from "axios"
import { Action } from "vuex-class"

import {BRow, BCol, BContainer, BInputGroup, BFormInput, BButton} from "bootstrap-vue"

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
export default class Register extends Vue {
    @Action("login") protected login: any
    @Action("logout") protected logout: any
    protected username: string
    protected email: string
    protected password: string
    protected confirmPassword: string
    constructor() {
        super()
        this.username = ""
        this.email = ""
        this.password = ""
        this.confirmPassword = ""
    }

    protected get theme() {
        return this.$store.getters.getTheme
    }

    protected async register() {
        if (this.password === this.confirmPassword) {
            try {
                await axios.post(
                    `${process.env.VUE_APP_API_URL}/register`,
                    {
                        username: this.username,
                        email: this.email,
                        password: this.password
                    },
                    { withCredentials: true }
                )
                try {
                    const { data } = await axios.post(
                        `${process.env.VUE_APP_API_URL}/login`,
                        { username: this.username, password: this.password },
                        { withCredentials: true }
                    )
                    this.$store.dispatch("setUsername", data.username)
                    this.$store.dispatch("setAdmin", data.admin)
                    this.$store.dispatch("setCanPost", data.canPost)
                    this.login(true)
                    this.$router.push("/")
                    this.$store.dispatch("addAlert", {
                        alertType: "success",
                        alertText:
                            "You have been registered and automatically logged in."
                    })
                } catch {
                    this.$store.dispatch("addAlert", {
                        alertType: "danger",
                        alertText:
                            "You have been registered, but there was " +
                            "a problem logging in automatically. Please log in manually."
                    })
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
                        alertText:
                            "There was a problem with registration. Please try again."
                    })
                }
            }
        } else {
            this.$store.dispatch("addAlert", {
                alertType: "warning",
                alertText: "Your passwords do not match. Please try again."
            })
        }
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
