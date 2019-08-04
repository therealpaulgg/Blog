import { Alert } from "@/models/alert";
import Cookies from "js-cookie";
import axios from "axios";

export default {
    setTheme({ commit }: { commit: any }, theme: string) {
        commit("SET_THEME", theme);
    },
    login({ commit, dispatch }: { commit: any, dispatch: any }, registered: boolean) {
        commit("LOGIN");
        if (registered) {
            // tslint:disable-next-line: max-line-length
            dispatch("addAlert", { alertType: "success", alertText: "You have successfully registered and have been logged in." });
        } else {
            dispatch("addAlert", { alertType: "success", alertText: "You have successfully logged in." });
        }
        dispatch("determineTokenRefreshInterval");
    },
    forceLogout({ commit }: { commit: any }) {
        commit("LOGOUT");
    },
    logout({ commit, dispatch }: { commit: any, dispatch: any }) {
        commit("LOGOUT");
        dispatch("addAlert", { alertType: "success", alertText: "You have successfully logged out." });
    },
    fetchPosts({ commit }: { commit: any }) {
        commit("FETCH_POSTS");
    },
    editContent({ commit }: { commit: any }, text: string) {
        commit("EDIT_CONTENT", text);
    },
    editCommentContent({ commit }: { commit: any }, text: string) {
        commit("EDIT_COMMENT_CONTENT", text);
    },
    editPostTitle({ commit }: { commit: any }, text: string) {
        commit("EDIT_POST_TITLE", text);
    },
    addAlert({ commit }: { commit: any }, alert: Alert) {
        commit("ADD_ALERT", alert);
    },
    editEditContent({ commit }: { commit: any }, text: string) {
        commit("EDIT_EDIT_CONTENT", text);
    },
    editEditTitle({ commit }: { commit: any }, text: string) {
        commit("EDIT_EDIT_TITLE", text);
    },
    setUsername({ commit }: { commit: any }, username: string) {
        commit("SET_USERNAME", username);
    },
    async determineTokenRefreshInterval({ commit, dispatch }: { commit: any, dispatch: any }) {
        try {
            const expiry = parseInt(Cookies.get("expiration"), 10);
            if (isNaN(expiry)) {
                commit("LOGOUT")
                dispatch("addAlert", {
                    alertType: "danger",
                    alertText: "There was a problem authenticating. Please ensure cookies are not being tampered with."
                });
            } else {
                const timeout = expiry - new Date().getTime();
                const delay = 10000;
                if (timeout - delay > 0) {
                    setTimeout(async () => {
                        try {
                            await axios.post("http://localhost:3000/renew-jwt", {}, { withCredentials: true });
                            dispatch("determineTokenRefreshInterval");
                        } catch {
                            commit("LOGOUT");
                            dispatch("addAlert", {
                                alertType: "danger",
                                alertText: "Your login session has expired, please log in again."
                            });
                        }
                    }, timeout - delay);
                } else {
                    await axios.post("http://localhost:3000/renew-jwt", {}, { withCredentials: true });
                    dispatch("determineTokenRefreshInterval");
                }
            }
        } catch (err) {
            commit("LOGOUT");
            dispatch("addAlert", {
                alertType: "danger",
                alertText: "Your login session has expired, please log in again."
            });
        }
    }
};
