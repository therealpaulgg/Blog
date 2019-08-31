<template>
    <div class="notifications">
        <div v-if="notifications.length > 0">
            <b-button :variant="theme" @click="dismissAll">Dismiss All</b-button>
            <PostNotification
                v-for="notification in notifications"
                :key="notification.id"
                :notification="notification"
            />
        </div>
        <p v-else>No notifications!</p>
    </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator"
import PostBlock from "@/components/PostBlock.vue" // @ is an alias to /src
import axios from "axios"
import { State } from "vuex-class"

import { PostNotificationModel } from "../models/notification"
import PostNotification from "../components/PostNotification.vue"
import { BButton } from "bootstrap-vue"

@Component({
    components: {
        PostNotification,
        BButton
    }
})
export default class Notifications extends Vue {
    constructor() {
        super()
    }

    get theme() {
        return this.$store.getters.getTheme
    }

    get notifications() {
        return this.$store.getters.getNotifications
    }

    protected mounted() {
        this.$store.dispatch("fetchNotifications", 1)
    }

    protected dismissAll() {
        this.$store.dispatch("dismissAllNotifications")
    }
}
</script>

<style lang="sass" scoped>
</style>
