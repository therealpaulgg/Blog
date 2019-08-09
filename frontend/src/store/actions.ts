import { Alert } from "@/models/alert";
import Cookies from "js-cookie";
import axios from "axios";

export default {
    setTheme({ commit }: { commit: any }, theme: string) {
        commit("SET_THEME", theme);
    },
    login({ commit, dispatch }: { commit: any, dispatch: any }) {
        commit("LOGIN");
        dispatch("determineTokenRefreshInterval");
    },
    forceLogout({ commit }: { commit: any }) {
        commit("LOGOUT");
    },
    logout({ commit, dispatch }: { commit: any, dispatch: any }) {
        commit("LOGOUT");
        dispatch("addAlert", {
            alertType: "success",
            alertText: "You have been successfully logged out."
        })
    },
    fetchPosts({ commit }: { commit: any }, page: number) {
        commit("FETCH_POSTS", page);
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
    setAdmin({ commit }: { commit: any }, admin: boolean) {
        commit("SET_ADMIN", admin);
    },
    setCanPost({ commit }: { commit: any }, canPost: boolean) {
        commit("SET_CAN_POST", canPost);
    },
    async determineTokenRefreshInterval({ commit, dispatch }: { commit: any, dispatch: any }) {
        try {
            const expiry = parseInt(Cookies.get("expiration"), 10);
            const authCookie = Cookies.get("auth");
            if (isNaN(expiry) || authCookie == null) {
                commit("LOGOUT");
                dispatch("addAlert", {
                    alertType: "danger",
                    alertText: "Your login session has expired. Please log in again."
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
