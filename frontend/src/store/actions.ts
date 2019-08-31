import { Alert } from "@/models/alert"
import axios from "axios"

export default {
    setTheme({ commit }: { commit: any }, theme: string) {
        commit("SET_THEME", theme)
    },
    login({ commit, dispatch }: { commit: any, dispatch: any }) {
        commit("LOGIN")
    },
    forceLogout({ commit }: { commit: any }) {
        commit("LOGOUT")
    },
    logout({ commit, dispatch }: { commit: any, dispatch: any }) {
        commit("LOGOUT")
        dispatch("addAlert", {
            alertType: "success",
            alertText: "You have been successfully logged out."
        })
    },
    fetchPosts({ commit }: { commit: any }, page: number) {
        commit("FETCH_POSTS", page)
    },
    fetchTagPosts({ commit }: { commit: any }, payload: { page: number, tag: string }) {
        commit("FETCH_TAG_POSTS", payload)
    },
    editContent({ commit }: { commit: any }, text: string) {
        commit("EDIT_CONTENT", text)
    },
    editCommentContent({ commit }: { commit: any }, text: string) {
        commit("EDIT_COMMENT_CONTENT", text)
    },
    editPostTitle({ commit }: { commit: any }, text: string) {
        commit("EDIT_POST_TITLE", text)
    },
    addAlert({ commit }: { commit: any }, alert: Alert) {
        commit("ADD_ALERT", alert)
    },
    editEditContent({ commit }: { commit: any }, text: string) {
        commit("EDIT_EDIT_CONTENT", text)
    },
    editEditTitle({ commit }: { commit: any }, text: string) {
        commit("EDIT_EDIT_TITLE", text)
    },
    setUsername({ commit }: { commit: any }, username: string) {
        commit("SET_USERNAME", username)
    },
    setAdmin({ commit }: { commit: any }, admin: boolean) {
        commit("SET_ADMIN", admin)
    },
    setCanPost({ commit }: { commit: any }, canPost: boolean) {
        commit("SET_CAN_POST", canPost)
    },
    editTags({ commit }: { commit: any }, tags: string) {
        commit("EDIT_TAGS", tags)
    },
    updateNotificationCount({ commit }: { commit: any }, count: number) {
        commit("UPDATE_NOTIFICATION_COUNT", count)
    },
    fetchNotifications({ commit }: { commit: any }, page: number) {
        commit("FETCH_NOTIFICATIONS", page)
    },
    dismissNotification({ commit }: { commit: any }, id: number) {
        commit("DISMISS_NOTIFICATION", id)
    },
    async dismissAllNotifications({ commit, dispatch }: { commit: any, dispatch: any }) {
        try {
            const { data } = await axios.post(`${process.env.VUE_APP_API_URL}/dismissall`,
                {},
                { withCredentials: true })
            commit("DISMISS_ALL_NOTIFICATIONS")
            dispatch("addAlert", {
                alertType: "success",
                alertText: data.success
            })
        } catch (err) {
            if (err.response) {
                dispatch("addAlert", {
                    alertType: "danger",
                    alertText: err.response.data.error
                })
            } else {
                dispatch("addAlert", {
                    alertType: "danger",
                    alertText: "Something went wrong."
                })
            }
        }

    }
}
