<template>
    <div class="login">
        <b-container>
            <div v-if="tokenExists && validToken">
                <h2>Password reset for: {{username}} @ {{email}}</h2>
                <b-row>
                    <b-col lg="4">
                        <b-input-group size="sm" prepend="Password">
                            <b-form-input
                                class="ifield"
                                v-model="password"
                                type="password"
                                v-on:keyup.enter="postResetData"
                            />
                        </b-input-group>
                        <br />
                        <b-input-group size="sm" prepend="Confirm Password">
                            <b-form-input
                                class="ifield"
                                v-model="confirmPassword"
                                type="password"
                                v-on:keyup.enter="postResetData"
                            />
                        </b-input-group>
                        <br />
                        <b-input-group size="sm">
                            <b-button :variant="theme" @click="postResetData">Submit Reset</b-button>
                        </b-input-group>
                    </b-col>
                </b-row>
            </div>
        </b-container>
    </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from "vue-property-decorator"
import axios from "axios"
import { Action } from "vuex-class"

import config from "../config"

@Component
export default class ResetPassword extends Vue {
    @Prop() token: string
    protected username: string
    protected email: string
    protected password: string
    protected confirmPassword: string
    protected tokenExists: boolean
    protected validToken: boolean
    constructor() {
        super()
        this.username = ""
        this.email = ""
        this.password = ""
        this.confirmPassword = ""
        this.tokenExists = this.token != null
        this.validToken = false
        this.getResetData()
    }

    protected get theme() {
        return this.$store.getters.getTheme
    }

    protected async getResetData() {
        if (this.token != null) {
            try {
                let { data } = await axios.get(
                    `${config.apiUrl}/resetpassword/${this.token}`
                )
                this.username = data.username
                this.email = data.email
                this.validToken = true
            } catch (err) {
                if (err.response) {
                    this.$store.dispatch("addAlert", {
                        alertType: "danger",
                        alertText: err.response.data.error
                    })
                    this.validToken = false
                }
            }
        } else {
            this.$store.dispatch("addAlert", {
                alertType: "danger",
                alertText:
                    "No token included. Please include a token in your request."
            })
        }
    }

    protected async postResetData() {
        if (this.password === this.confirmPassword) {
            try {
                let { data } = await axios.post(
                    `${config.apiUrl}/resetpassword/${this.token}`,
                    { password: this.password }
                )
                this.$store.dispatch("addAlert", {
                    alertType: "success",
                    alertText: data.success
                })
                this.$router.push("/login")
            } catch (err) {
                if (err.response) {
                    this.$store.dispatch("addAlert", {
                        alertType: "danger",
                        alertText: err.response.data.error
                    })
                    this.validToken = false
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
