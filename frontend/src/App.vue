<template>
    <div id="app" :class="getTheme">
        <link rel="stylesheet" :href="cssUrl" data-noprefix />
        <div class="jumbotron jumbotron-fluid" :class="getTheme">
            <div class="container">
                <h1 v-if="blogTitle !== null">{{blogTitle}}</h1>
                <h1 v-else>The Blog for Engineers</h1>
                <hr />
                <b-alert
                    v-if="alert"
                    :show="dismissCountDown"
                    dismissible
                    fade
                    :variant="alert.alertType"
                    @dismissed="alert = null; dismissCountDown = 0"
                    @dismiss-count-down="countDownChanged"
                >{{alert.alertText}}</b-alert>
                <div>
                    <b-navbar toggleable="lg">
                        <b-navbar-toggle target="nav-collapse" />
                        <b-collapse id="nav-collapse" is-nav>
                            <b-navbar-nav tabs class="navbar-nav">
                                <b-nav-item
                                    to="/"
                                    :active="$route.path == '/'"
                                >Home</b-nav-item>
                                <b-nav-item
                                    to="/tags"
                                    :active="$route.path == '/tags'"
                                >Tags</b-nav-item>
                                <b-nav-item
                                    v-if="isAuthenticated && canPost"
                                    to="/newpost"
                                    :active="$route.path == '/newpost'"
                                >New Post</b-nav-item>
                                <b-nav-item v-if="isAuthenticated" @click="logout">Logout</b-nav-item>
                                <b-nav-item
                                    v-else
                                    to="/login"
                                    :active="$route.path == '/login'"
                                >Login</b-nav-item>
                                <b-nav-item
                                    v-if="!isAuthenticated"
                                    to="/register"
                                    :active="$route.path == '/register'"
                                >Register</b-nav-item>
                                <b-nav-item
                                    v-if="isAuthenticated && isAdmin"
                                    to="/administration"
                                    :active="$route.path == '/administration'"
                                >Administration</b-nav-item>
                                <b-nav-item
                                    v-if="isAuthenticated"
                                    to="/profile"
                                    :active="$route.path == '/profile'"
                                >Profile</b-nav-item>
                            </b-navbar-nav>
                        </b-collapse>
                    </b-navbar>
                </div>
                <br />
                <!-- <keep-alive include="Home"> -->
                <router-view :key="$route.fullPath" />
                <!-- </keep-alive> -->
                <transition name="fade">
                    <font-awesome-icon class="themebtn" @click="changeTheme" :icon="icon"></font-awesome-icon>
                </transition>
                <span v-if="isAuthenticated">
                    <div class="notification">
                        <font-awesome-icon icon="bell" @click="gotoNotifications"></font-awesome-icon>
                    </div>
                    <div class="notificationcount" v-if="notificationCount > 0">
                        <span
                            v-if="notificationCount > 0 && notificationCount < 100"
                        >{{notificationCount}}</span>
                        <span v-else>99+</span>
                    </div>
                </span>
            </div>
        </div>
    </div>
</template>

<script <script lang="ts">
import { State, Getter, Action } from "vuex-class"
import { Component, Vue } from "vue-property-decorator"
import { BNav, BNavItem, BAlert, BNavbarNav, BCollapse, BNavbar, BNavbarToggle } from "bootstrap-vue"
import { determineTokenRefreshInterval } from "./loginfunc"
import axios from "axios"
import { close } from "./websocket"

const alertFadeTime: number = 5

@Component({
    components: {
        BNav,
        BNavItem,
        BAlert,
        BNavbarNav,
        BCollapse,
        BNavbar,
        BNavbarToggle
    }
})
export default class App extends Vue {
    @Action("setTheme") protected setTheme: any
    @Action("logout") protected logoutAction: any
    @Getter("isAuthenticated") protected isAuthenticated: boolean
    @Getter("canPost") protected canPost: boolean
    @Getter("isAdmin") protected isAdmin: boolean
    protected dismissCountDown: number = 0
    protected blogTitle: string | null
    @Getter("getTheme") private getTheme: string
    @Getter("getNotificationCount") private notificationCount: number

    constructor() {
        super()
        this.blogTitle = null
        this.pageInfo()
    }

    protected changeTheme() {
        this.getTheme === "light"
            ? this.setTheme("dark")
            : this.setTheme("light")
    }

    protected countDownChanged(newCountdown) {
        this.dismissCountDown = newCountdown
    }

    get icon() {
        return this.getTheme === "light" ? "sun" : "moon"
    }

    get cssUrl() {
        return this.getTheme === "light"
            ? "https://cdn.jsdelivr.net/gh/PrismJS/prism-themes/themes/prism-base16-ateliersulphurpool.light.css"
            : "https://cdn.jsdelivr.net/gh/dracula/prism/css/dracula-prism.css"
    }

    get alert() {
        this.dismissCountDown = alertFadeTime
        return this.$store.state.alert
    }
    set alert(val) {
        this.$store.dispatch("addAlert", null)
    }

    protected mounted() {
        if (this.isAuthenticated) {
            determineTokenRefreshInterval()
        }
    }

    protected gotoNotifications() {
        this.$router.push("/notifications")
    }

    protected logout() {
        this.logoutAction()
        close()
        this.$router.push("/")
    }

    protected pageInfo() {
        axios.get(`${process.env.VUE_APP_API_URL}/pageinfo`)
            .then((res) => {
                this.blogTitle = res.data.blogTitle
            })
            .catch((err) => {
                let text = ""
                if (err.response) {
                    text = err.response.data.error
                } else {
                    text = "Something went wrong."
                }
                this.$store.dispatch("addAlert", {
                    alertType: "danger",
                    alertText: text
                })

            })
    }
}
</script>

<style lang="sass">
@import url("https://cdn.jsdelivr.net/npm/katex@0.10.2/dist/katex.min.css")
@import url('https://fonts.googleapis.com/css?family=Open+Sans&display=swap')
@import "./assets/sass/variables.sass"
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
.notificationcount
    position: fixed
    background-color: $red
    border-radius: 15px
    width: 30px
    height: 30px
    text-align: center
    top: 35px
    right: 40px
    line-height: 30px
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

.betterscrollbar::-webkit-scrollbar
    width: 10px

.betterscrollbar::-webkit-scrollbar-thumb
    border-radius: 10px
    -webkit-box-shadow: inset 0 0 6px rgba(0,0,0,.3)

.betterscrollbar::-webkit-scrollbar-track
    -webkit-box-shadow: inset 0 0 6px rgba(0,0,0,0.3)
thead
    background-color: rgba(0,0,0,0.15)
tr:nth-child(even) 
    background-color: rgba(0,0,0,0.15)
table, th, td
    border: 1px solid rgba(0,0,0,0.15)
th, td
    padding: 10px
.nav-item .nav-link
    padding: 8px 16px 8px 16px !important
    border-top-left-radius: 0.25rem
    border-top-right-radius: 0.25rem
    border: 1px solid transparent
@media (min-width: 992px)
    .nav-item .nav-link
        border-bottom: 0px transparent
.navbar-nav
    width: 100%
.navbar
    padding: 0px !important
.nav-link:hover
    border-color: $darkerwhite !important
.nav-item .active
    border-color: $darkerwhite
.navbar-nav
    border-bottom: $darkerwhite 1px solid
.light
    a
        color: $lighttext !important
        transition: 0.5s
        -webkit-transition: 0.5s
    a:hover
        color: $lighthover !important
        transition: 0.5s
        -webkit-transition: 0.5s
    .betterscrollbar::-webkit-scrollbar-thumb
        background-color: $lightscroll !important
    .preview::-webkit-scrollbar-thumb
        background-color: $lightscroll !important
    hr
        background-color: gray
    transition: 0.5s
    -webkit-transition: 0.5s
    .jumbotron::-webkit-scrollbar-thumb
        background-color: $lightscroll !important
    .nav-item .active
        background-color: $lightfg
    .navbar-toggler
        background-color: white !important
.dark
    background-color: $darkbg !important
    color: $darktext
    .preview::-webkit-scrollbar-thumb
        background-color: $darkscroll
    .jumbotron::-webkit-scrollbar-thumb
        background-color: $darkscroll !important
    .betterscrollbar::-webkit-scrollbar-thumb
        background-color: $darkscroll !important
    .nav-item .active
        background-color: $darkfg !important
    .navbar-toggler
        background-color: $darkfg !important
    .navbar-toggler-icon
        color: $darktext !important
    a
        color: $darktext !important
        transition: 0.5s
        -webkit-transition: 0.5s
    hr
        background-color: $darktext
    a:hover
        color: $darkhover !important
        transition: 0.5s
        -webkit-transition: 0.5s 
    transition: 0.5s
    -webkit-transition: 0.5s
.fade-enter-active, .fade-leave-active 
    transition: opacity 0.5s
.fade-enter, .fade-leave-to /* .fade-leave-active below version 2.1.8 */
    opacity: 0
</style>
