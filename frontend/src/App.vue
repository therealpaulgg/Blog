<template>
    <div id="app" :class="getTheme">
        <link rel="stylesheet" :href="cssUrl" data-noprefix />
        <div class="jumbotron jumbotron-fluid" :class="getTheme">
            <div class="container">
                <h1>The Blog for Engineers</h1>
                <hr />
                <b-alert
                    v-if="alert"
                    show
                    dismissible
                    fade
                    :variant="alert.alertType"
                    @dismissed="alert = null"
                >{{alert.alertText}}</b-alert>
                <div>
                    <b-nav tabs>
                        <b-nav-item class="test" to="/" v-bind:active="$route.path == '/'">Home</b-nav-item>
                        <b-nav-item
                            class="test"
                            to="/tags"
                            v-bind:active="$route.path == '/tags'"
                        >Tags</b-nav-item>
                        <b-nav-item
                            v-if="isAuthenticated && canPost"
                            to="/newpost"
                            v-bind:active="$route.path == '/newpost'"
                        >New Post</b-nav-item>
                        <b-nav-item v-if="isAuthenticated" @click="logout">Logout</b-nav-item>
                        <b-nav-item v-else to="/login" v-bind:active="$route.path == '/login'">Login</b-nav-item>
                        <b-nav-item
                            v-if="!isAuthenticated"
                            to="/register"
                            v-bind:active="$route.path == '/register'"
                        >Register</b-nav-item>
                        <b-nav-item
                            v-if="isAuthenticated && isAdmin"
                            to="/administration"
                            v-bind:active="$route.path == '/administration'"
                        >Administration</b-nav-item>
                        <b-nav-item
                            v-if="isAuthenticated"
                            to="/profile"
                            v-bind:active="$route.path == '/profile'"
                        >Profile</b-nav-item>
                    </b-nav>
                </div>
                <br />
                <!-- <keep-alive include="Home"> -->
                <router-view :key="$route.fullPath" />
                <!-- </keep-alive> -->
                <transition name="fade">
                    <font-awesome-icon class="themebtn" @click="changeTheme" :icon="icon"></font-awesome-icon>
                </transition>
                <!-- <div class="notification">
                <font-awesome-icon icon="bell" @click="gotoNotifications"></font-awesome-icon>
                </div>-->
            </div>
        </div>
    </div>
</template>

<script <script lang="ts">
import { State, Getter, Action } from "vuex-class";
import { Component, Vue } from "vue-property-decorator";
import Cookies from "js-cookie";
import BootstrapVue from "bootstrap-vue";
import axios from "axios";

@Component
export default class App extends Vue {
    @Action("setTheme") protected setTheme: any;
    @Action("logout") protected logoutAction: any;
    @Getter("isAuthenticated") protected isAuthenticated: boolean;
    @Getter("canPost") protected canPost: boolean;
    @Getter("isAdmin") protected isAdmin: boolean;
    @Getter("getTheme") private getTheme: string;

    protected changeTheme() {
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

    get alert() {
        return this.$store.state.alert;
    }
    set alert(val) {
        this.$store.dispatch("addAlert", null);
    }

    protected mounted() {
        if (this.isAuthenticated) {
            this.determineTokenRefreshInterval();
        }
    }

    protected async determineTokenRefreshInterval() {
        try {
            const expiry = parseInt(Cookies.get("expiration"), 10);
            const authCookie = Cookies.get("auth");
            if (isNaN(expiry) || authCookie == null) {
                this.$store.commit("LOGOUT");
                this.$router.push("/login");
                this.$store.dispatch("addAlert", {
                    alertType: "danger",
                    alertText:
                        "Your login session has expired. Please log in again."
                });
            } else {
                const timeout = expiry - new Date().getTime();
                const delay = 10000;
                if (timeout - delay > 0) {
                    setTimeout(async () => {
                        try {
                            await axios.post(
                                "http://localhost:3000/renew-jwt",
                                {},
                                { withCredentials: true }
                            );
                            this.determineTokenRefreshInterval();
                        } catch {
                            if (this.isAuthenticated) {
                                this.$store.commit("LOGOUT");
                                this.$router.push("/login");
                                this.$store.dispatch("addAlert", {
                                    alertType: "danger",
                                    alertText:
                                        "Your login session has expired, please log in again."
                                });
                            }
                        }
                    }, timeout - delay);
                } else {
                    await axios.post(
                        "http://localhost:3000/renew-jwt",
                        {},
                        { withCredentials: true }
                    );
                    this.determineTokenRefreshInterval();
                }
            }
        } catch (err) {
            this.$store.commit("LOGOUT");
            this.$store.dispatch("addAlert", {
                alertType: "danger",
                alertText:
                    "Your login session has expired, please log in again."
            });
        }
    }

    protected gotoNotifications() {
        this.$router.push("/notifications");
    }

    protected logout() {
        this.logoutAction();
        this.$router.push("/");
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
code
    font-family: "Fira Code" !important
blockquote 
  margin: 0 auto
  padding: 1em
  border-left: 5px solid

blockquote:before 
  display: none

blockquote:not(:first-of-type) 
  margin-top: .5em

blockquote p 
  font-size: 12pt
  line-height: 1.4

blockquote footer:before 
  content: '— '

blockquote:nth-of-type(even) 
  text-align: right
  border-left: none
  border-right: 5px solid

blockquote:nth-of-type(even) footer 
  text-align: right

blockquote:nth-of-type(even) footer:before 
  content: ''

blockquote:nth-of-type(even) footer:after 
  content: ' —'

@element 'blockquote' and (min-width: 300px) 
  blockquote 
    padding: 1em 20% 1em 1em
  
  blockquote p 
    font-size: 14pt
  
  blockquote:nth-of-type(even) 
    padding: 1em 1em 1em 20%
  

.emoji
    height: 1.2em !important
    width: 1.2em !important
.notification
    position: fixed
    top: -3px
    right: 40px
    margin: 20px
    cursor: pointer
.themebtn
    position: fixed
    top: 0
    right: 0
    margin: 20px
    cursor: pointer
html, body
    overflow: hidden
    height: 100vh
    font-family: Open Sans !important
.jumbotron
    height: 100vh
    position: relative
    transition: 0.5s
    -webkit-transition: 0.5s
    overflow-y: auto
.jumbotron::-webkit-scrollbar
    width: 10px
.jumbotron::-webkit-scrollbar-thumb
    border-radius: 10px
    -webkit-box-shadow: inset 0 0 6px rgba(0,0,0,.3)
.jumbotron::-webkit-scrollbar-track
    -webkit-box-shadow: inset 0 0 6px rgba(0,0,0,0.3)
.preview::-webkit-scrollbar
    width: 10px

.preview::-webkit-scrollbar-thumb
    border-radius: 10px
    -webkit-box-shadow: inset 0 0 6px rgba(0,0,0,.3)

.preview::-webkit-scrollbar-track
    -webkit-box-shadow: inset 0 0 6px rgba(0,0,0,0.3)

thead
    background-color: rgba(0,0,0,0.15)
tr:nth-child(even) 
    background-color: rgba(0,0,0,0.15)
table, th, td
    border: 1px solid rgba(0,0,0,0.15)
th, td
    padding: 10px

.light
    a
        color: black !important
        transition: 0.5s
        -webkit-transition: 0.5s
    a:hover
        color: #00ccff !important
        transition: 0.5s
        -webkit-transition: 0.5s
    .preview::-webkit-scrollbar-thumb
        background-color: #dddddd !important
    hr
        background-color: gray
    transition: 0.5s
    -webkit-transition: 0.5s
    .jumbotron::-webkit-scrollbar-thumb
        background-color: #cccccc !important
.dark
    background-color: #20212B !important
    color: white
    .preview::-webkit-scrollbar-thumb
        background-color: #3e404c
    .jumbotron::-webkit-scrollbar-thumb
        background-color: #3e404c !important
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
