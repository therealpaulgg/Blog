import { Alert } from "@/models/alert";

export default {
    setTheme({ commit }: { commit: any }, theme: string) {
        commit("SET_THEME", theme);
    },
    login({ commit, dispatch }: { commit: any, dispatch: any }) {
        commit("LOGIN");
        dispatch("addAlert", {alertType: "success", alertText: "You have successfully logged in."});
    },
    logout({ commit, dispatch }: { commit: any, dispatch: any }) {
        commit("LOGOUT");
        dispatch("addAlert", {alertType: "success", alertText: "You have successfully logged out."});
    },
    fetchPosts({ commit }: { commit: any}) {
        commit("FETCH_POSTS");
    },
    editContent({ commit }: { commit: any}, text: string) {
        commit("EDIT_CONTENT", text);
    },
    editCommentContent({ commit }: { commit: any}, text: string) {
        commit("EDIT_COMMENT_CONTENT", text);
    },
    editPostTitle({ commit }: { commit: any}, text: string) {
        commit("EDIT_POST_TITLE", text);
    },
    addAlert({ commit }: { commit: any}, alert: Alert) {
        commit("ADD_ALERT", alert);
    },
    dismissAlert({ commit }: { commit: any}) {
        commit("DISMISS_ALERT");
    }
};
