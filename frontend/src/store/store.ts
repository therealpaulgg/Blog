import Vue from "vue";
import Vuex from "vuex";
import actions from "./actions";
import getters from "./getters";
import mutations from "./mutations";
import { State } from "@/models/state";
import createPersistedState from "vuex-persistedstate";

Vue.use(Vuex);

function defaultState(): State {
    return {
        theme: "light",
        authenticated: false,
        posts: null,
        postTitle: "",
        content: "",
        commentContent: "",
        alerts: []
    };
}

export default new Vuex.Store({
    state: defaultState(),
    plugins: [createPersistedState({
        paths: [
            "authenticated",
            "theme",
            "content",
            "commentContent",
            "postTitle"
        ]
    })],
    mutations,
    actions,
    getters
});
