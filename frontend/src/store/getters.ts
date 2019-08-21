import { State } from "@/models/state"

export default {
    getTheme(state: State) {
        return state.theme
    },
    isAuthenticated(state: State) {
        return state.authenticated
    },
    getContent(state: State) {
        return state.content
    },
    getCommentContent(state: State) {
        return state.commentContent
    },
    getPostTitle(state: State) {
        return state.postTitle
    },
    getEditContent(state: State) {
        return state.editContent
    },
    getEditTitle(state: State) {
        return state.editPostTitle
    },
    isAdmin(state: State) {
        return state.isAdmin
    },
    canPost(state: State) {
        return state.canPost
    },
    getAlert(state: State) {
        return state.alert
    },
    getTags(state: State) {
        return state.tags
    },
    getNotificationCount(state: State) {
        return state.notificationCount
    },
    getNotifications(state: State) {
        return state.notifications
    }
}
