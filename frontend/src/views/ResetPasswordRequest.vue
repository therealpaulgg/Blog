<template>
    <div class="login">
        <b-container>
            <div>
                <h2>Reset your password</h2>
                <b-row>
                    <b-col lg="4">
                        <b-input-group size="sm" prepend="Email">
                            <b-form-input
                                class="ifield"
                                v-model="email"
                                type="email"
                                v-on:keyup.enter="sendReset"
                            />
                        </b-input-group>
                        <br />
                        <b-input-group size="sm">
                            <b-button :variant="theme" @click="sendReset">Submit Reset Request</b-button>
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
export default class ResetPassword extends Vue {
    protected email: string
    constructor() {
        super()
        this.email = ""
    }

    protected get theme() {
        return this.$store.getters.getTheme
    }

    protected async sendReset() {
        if (this.email.length > 0) {
            try {
                const { data } = await axios.post(
                    `${process.env.VUE_APP_API_URL}/resetpasswordreq`,
                    { email: this.email }
                )
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
        } else {
            this.$store.dispatch("addAlert", {
                alertType: "warning",
                alertText: "You must include an email in your request."
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
