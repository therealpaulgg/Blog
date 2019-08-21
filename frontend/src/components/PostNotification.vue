<template>
    <div
        class="postnotification"
        :class="{'light': getTheme === 'light', 'dark': getTheme === 'dark'}"
        v-if="alive"
        @click="gotoPost(notification.postId, notification.postUrlTitle)"
    >
        <div class="metadata">
            <span class="metaelement">
                <font-awesome-icon icon="calendar-alt"></font-awesome-icon>
                <span class="metaelement">
                    {{date}},
                    <i>{{timeSince}}</i>
                </span>
            </span>
            <span class="metaelement" v-if="repliesCount">
                <font-awesome-icon icon="notifications"></font-awesome-icon>
                {{repliesCount}}
            </span>
            <span style="float: right">
                <a @click.stop="dismiss(true)" class="delete metaelement">Dismiss</a>
            </span>
        </div>
        <div style="word-wrap: break-word" v-html="renderedContent"></div>
    </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator"
import { Getter } from "vuex-class"
import moment from "moment"
import { mdNoHtml } from "../mdparser"
import axios from "axios"
import config from "../config"
import { PostNotificationModel } from "../models/notification";

@Component
export default class notification extends Vue {
    @Prop() protected notification: PostNotificationModel
    protected alive: boolean
    protected renderedContent: string
    protected repliesCount: number | null
    @Getter("getTheme") private getTheme: string

    constructor() {
        super()
        this.alive = true
        this.repliesCount = null
        this.renderedContent =
            this.notification != null ? mdNoHtml.render(this.notification.content) : null
    }

    get date() {
        return this.notification
            ? moment
                .utc(this.notification.createdAt)
                .local()
                .format("MM/DD/YYYY, HH:mm")
            : null
    }

    get timeSince() {
        return this.notification ? moment(this.notification.createdAt).fromNow() : null
    }

    protected async gotoPost(id, urlTitle) {
        this.dismiss(false)
        this.$router.push(`/posts/${id}/${urlTitle}`)
    }

    protected async dismiss(show) {
        try {
            const { data } = await axios.post(
                `${config.apiUrl}/dismiss`,
                { id: this.notification.id },
                { withCredentials: true }
            )
            if (show) {
                this.$store.dispatch("addAlert", {
                alertType: "success",
                alertText: data.success
            })
            }
            this.$store.dispatch("dismissNotification", this.notification.id)
            console.log("bye")
            this.alive = false
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
    }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="sass">
.delete
    color: #ff7474 !important
    cursor: pointer
    border-radius: 5px
    padding: 10px
    width: auto
    height: auto
.metadata
    border-radius: 20px
    padding: 10px
    margin-bottom: 10px
.metaelement
    margin-left: 10px
    margin-right: 10px
.postnotification
    padding: 20px
    margin: 20px
    border-radius: 10px
    max-height: 300px
    overflow-y: auto
.postnotification:hover
    border-radius: 20px
    transition: 0.5s
    -webkit-transition: 0.5s
    cursor: pointer
.postnotification.light:hover
    background-color: #f2feff !important
.postnotification.dark:hover
    background-color: #3e4154 !important
.postnotification::-webkit-scrollbar
    width: 10px
.postnotification::-webkit-scrollbar-thumb
    border-radius: 10px
    -webkit-box-shadow: inset 0 0 6px rgba(0,0,0,.3)
.postnotification::-webkit-scrollbar-track
    -webkit-box-shadow: inset 0 0 6px rgba(0,0,0,0.3)
.dark
    background-color: #2a2c39 !important
    color: white
    .postnotification::-webkit-scrollbar-thumb
        background-color: #3e404c
    .delete
        background-color: #2a2c39 !important
    .metadata
        background-color: #20212B !important
.light
    background-color: white !important
    color: black
    .postnotification::-webkit-scrollbar-thumb
        background-color: #dddddd
    .delete
        background-color: #ffffff !important
    .metadata
        background-color: #e9ecef !important
</style>
