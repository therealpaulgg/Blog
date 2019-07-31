<template>
    <div id="app">
        <link rel="stylesheet" :href="cssUrl" data-noprefix />
        <div class="jumbotron jumbotron-fluid" :class="getTheme">
            <div class="container">
                <h1>The Blog for Engineers</h1>
                <hr>
                <div>
                    <b-nav tabs>
                        <b-nav-item class="test" to="/" v-bind:active="$route.path == '/'">Home</b-nav-item>
                        <b-nav-item v-if="isAuthenticated" to="/newpost" v-bind:active="$route.path == '/newpost'">New Post</b-nav-item>
                        <b-nav-item v-if="isAuthenticated" @click="logout">Logout</b-nav-item>
                        <b-nav-item v-else to="/login" v-bind:active="$route.path == '/login'">Login</b-nav-item>
                    </b-nav>
                </div>
                <br>
                <keep-alive>
                <router-view />
                </keep-alive>
                <transition name="fade">
                    <font-awesome-icon class="themebtn" @click="changeTheme" :icon="icon"></font-awesome-icon>
                </transition>
            </div>
        </div>
    </div>
</template>

<script <script lang="ts">
import { State, Getter, Action } from "vuex-class";
import { Component, Vue } from "vue-property-decorator";

@Component
export default class App extends Vue {
    @Getter("getTheme") getTheme: string;
    @Action("setTheme") setTheme: any;
    @Action("logout") logoutAction: any
    @Getter("isAuthenticated") isAuthenticated: boolean

    changeTheme() {
        this.getTheme === "light"
            ? this.setTheme("dark")
            : this.setTheme("light");
    }

    get icon() {
        return this.getTheme === "light" ? "sun" : "moon";
    }

    get cssUrl() {
        return this.getTheme === "light"
            ? "https://cdn.jsdelivr.net/gh/PrismJS/prism-themes/themes/prism-base16-ateliersulphurpool.light.css"
            : "https://cdn.jsdelivr.net/gh/dracula/prism/css/dracula-prism.css";
    }

    logout() {
        this.logoutAction()
        this.$cookie.delete("auth", { domain: "localhost"})
        this.$router.push("/")
    }
}
</script>


<style lang="sass">
@import url("https://cdn.jsdelivr.net/npm/katex@0.10.2/dist/katex.min.css")
@import url('https://fonts.googleapis.com/css?family=Open+Sans&display=swap')
// https://stackoverflow.com/questions/3245141/using-otf-fonts-on-web-browsers#3245187
@font-face 
    font-family: "Fira Code"
    src: url("https://cdn.jsdelivr.net/gh/tonsky/FiraCode@0.2.1/FiraCode-Regular.otf") format("opentype")
.themebtn
    position: absolute
    top: 0
    right: 0
    margin: 20px
    cursor: pointer
html, body
    overflow: hidden
    height: 100vh
    font-family: "Open Sans", sans-serif !important
.jumbotron
    height: 100vh
    position: relative
    transition: 0.5s
    -webkit-transition: 0.5s
    overflow-y: auto
.light
    a
        color: black !important
        transition: 0.5s
        -webkit-transition: 0.5s
    a:hover
        color: #00ccff !important
        transition: 0.5s
        -webkit-transition: 0.5s
    
    hr
        background-color: gray
    transition: 0.5s
    -webkit-transition: 0.5s

.dark
    background-color: #20212B !important
    color: white

    a.active
        background-color: #2a2c39 !important 

    a
        color: white !important
        transition: 0.5s
        -webkit-transition: 0.5s
    
    hr
        background-color: white
    
    a:hover
        color: #FF79c6 !important
        transition: 0.5s
        -webkit-transition: 0.5s

    transition: 0.5s
    -webkit-transition: 0.5s
    
.fade-enter-active, .fade-leave-active 
    transition: opacity 0.5s
.fade-enter, .fade-leave-to /* .fade-leave-active below version 2.1.8 */
    opacity: 0
</style>
