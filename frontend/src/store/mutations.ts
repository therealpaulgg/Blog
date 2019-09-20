import { State } from "@/models/state"
import axios from "axios"
import { PostModel } from "@/models/post"
import { Alert } from "@/models/alert"

import Cookies from "js-cookie"
import { PostNotificationModel } from "@/models/notification"
import Vue from "vue"

export default {
    COMMENT_DROPDOWN(state: State, active: boolean) {
        state.showingCommentDropdown = active
    },
    SET_THEME(state: State, theme: string) {
        state.theme = theme
    },
    LOGIN(state: State) {
        state.authenticated = true
    },
    LOGOUT(state: State) {
        state.authenticated = false
        state.username = ""
        Cookies.remove("auth", { domain: process.env.VUE_APP_DOMAIN })
        Cookies.remove("expiration", { domain: process.env.VUE_APP_DOMAIN })
    },
    async FETCH_POSTS(state: State, page: number) {
        const { data } = await axios.get(`${process.env.VUE_APP_API_URL}/posts/${page}`, {withCredentials: true})
        if (page === 1) {
            state.posts = data.posts as PostModel[]
            state.pages = data.pages as number
        } else {
            const posts = data.posts as PostModel[]
            for (const post of posts) {
                state.posts.push(post)
            }
        }
    },
    async FETCH_TAG_POSTS(state: State, payload: { page: number, tag: string }) {
        const { data } = await axios.get(`${process.env.VUE_APP_API_URL}/tag/${payload.tag}/${payload.page}`, {withCredentials: true})
        if (payload.page === 1) {
            state.tagPosts = data.posts as PostModel[]
            state.tagPages = data.pages as number
        } else {
            const posts = data.posts as PostModel[]
            for (const post of posts) {
                state.tagPosts.push(post)
            }
        }
    },
    async FETCH_NOTIFICATIONS(state: State, page: number) {
        try {
            const { data } = await axios.get(`${process.env.VUE_APP_API_URL}/notifications/${page}`,
                { withCredentials: true })
            if (page === 1) {
                state.notifications = data.notifications as PostNotificationModel[]
                state.tagPages = data.pages as number
            } else {
                const notifications = data.notifications as PostNotificationModel[]
                for (const notification of notifications) {
                    state.notifications.push(notification)
                }
            }
            state.notificationCount = data.count
        // tslint:disable-next-line: no-empty
        } catch { }
    },
    DISMISS_NOTIFICATION(state: State, id: number) {
        state.notificationCount--
        Vue.delete(state.notifications, state.notifications.indexOf(state.notifications.find((not) => not.id === id)))
    },
    EDIT_CONTENT(state: State, text: string) {
        state.content = text
    },
    EDIT_COMMENT_CONTENT(state: State, text: string) {
        state.commentContent = text
    },
    EDIT_POST_TITLE(state: State, text: string) {
        state.postTitle = text
    },
    ADD_ALERT(state: State, alert: Alert) {
        state.alert = alert
    },
    EDIT_EDIT_CONTENT(state: State, text: string) {
        state.editContent = text
    },
    EDIT_EDIT_TITLE(state: State, text: string) {
        state.editPostTitle = text
    },
    SET_USERNAME(state: State, username: string) {
        state.username = username
    },
    SET_ADMIN(state: State, admin: boolean) {
        state.isAdmin = admin
    },
    SET_CAN_POST(state: State, canPost: boolean) {
        state.canPost = canPost
    },
    EDIT_TAGS(state: State, tags: string) {
        state.tags = tags
    },
    UPDATE_NOTIFICATION_COUNT(state: State, count: number) {
        state.notificationCount = count
    },
    DISMISS_ALL_NOTIFICATIONS(state: State) {
        state.notificationCount = 0
        state.notifications = []
    }
}
