import { State } from "@/models/state";
import axios from "axios";
import { PostModel } from "@/models/post";
import { Alert } from '@/models/alert';

export default {
    SET_THEME(state: State, theme: string) {
        state.theme = theme;
    },
    LOGIN(state: State) {
        state.authenticated = true;
    },
    LOGOUT(state: State) {
        state.authenticated = false;
    },
    async FETCH_POSTS(state: State) {
        const { data } = await axios.get("http://localhost:3000/posts");
        state.posts = data as PostModel[];
    },
    EDIT_CONTENT(state: State, text: string) {
        state.content = text;
    },
    EDIT_COMMENT_CONTENT(state: State, text: string) {
        state.commentContent = text;
    },
    EDIT_POST_TITLE(state: State, text: string) {
        state.postTitle = text;
    },
    ADD_ALERT(state: State, alert: Alert) {
        state.alerts.push(alert);
    },
    DISMISS_ALERT(state: State) {
        state.alerts.shift()
    }
};
