<template>
    <div id="initialsetup">
        <b-container>
            <div v-if="true">
                <p>Welcome to the Blog for Engineers! Please fill out your information to create an admin account.</p>
                <b-row>
                    <b-col lg="4">
                        <b-input-group size="sm" prepend="Username">
                            <b-form-input
                                class="ifield"
                                v-model="username"
                                v-on:keyup.enter="setup"
                            />
                        </b-input-group>
                        <br />
                        <b-input-group size="sm" prepend="Email">
                            <b-form-input
                                class="ifield"
                                v-model="email"
                                type="email"
                                v-on:keyup.enter="setup"
                            />
                        </b-input-group>
                        <br />
                        <b-input-group size="sm" prepend="Password">
                            <b-form-input
                                class="ifield"
                                v-model="password"
                                type="password"
                                v-on:keyup.enter="setup"
                            />
                        </b-input-group>
                        <br />
                        <b-input-group size="sm" prepend="Confirm Password">
                            <b-form-input
                                class="ifield"
                                v-model="confirmPassword"
                                type="password"
                                v-on:keyup.enter="setup"
                            />
                        </b-input-group>
                        <br />
                        <b-input-group size="sm">
                            <b-button :variant="theme" @click="setup">Register</b-button>
                        </b-input-group>
                    </b-col>
                </b-row>
            </div>
        </b-container>
    </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator"
import axios from "axios"

import { State, Action } from "vuex-class"
import { BInputGroup, BFormInput, BButton, BCol, BRow, BContainer } from "bootstrap-vue"

@Component({
    components: {
        BInputGroup, BFormInput, BButton, BCol, BRow, BContainer
    }
})
export default class InitialSetup extends Vue {
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

    protected async setup() {
        try {
            await axios.post(
                `${process.env.VUE_APP_API_URL}/initialsetup`,
                {
                    username: this.username,
                    email: this.email,
                    password: this.password
                },
                { withCredentials: true }
            )
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
                alertText: "You have registered and have been logged in."
            })
        } catch (err) {
            this.$store.dispatch("addAlert", {
                alertType: "danger",
                alertText: "Something went wrong."
            })
        }
    }
}
</script>
