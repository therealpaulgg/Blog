<template>
    <div class="login">
        <b-container>
            <b-row>
                <b-col lg="4">
                    <b-input-group size="sm" prepend="Username">
                        <b-form-input class="ifield" v-model="username" />
                    </b-input-group>
                    <br>
                    <b-input-group size="sm" prepend="Password">
                        <b-form-input class="ifield" v-model="password" type="password" />
                    </b-input-group>
                    <br />
                    <a class="button" @click="authenticate">Login</a>
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
export default class Home extends Vue {
    @Action("login") protected login: any;
    @Action("logout") protected logout: any;
    protected username: string;
    protected password: string;
    constructor() {
        super();
        this.username = "";
        this.password = "";
    }

    protected authenticate() {
        axios
            .post(
                "http://localhost:3000/login",
                { username: this.username, password: this.password },
                { withCredentials: true }
            )
            .then(res => {
                this.login();
                this.$router.push("/");
            })
            .catch((err: Error) => {
                console.log(err.message);
                this.$store.dispatch("addAlert", {
                    alertType: "danger",
                    alertText: "Incorrect username or password."
                });
            });
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
