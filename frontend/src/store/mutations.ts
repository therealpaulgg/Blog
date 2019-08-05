import { State } from "@/models/state";
import axios from "axios";
import { PostModel } from "@/models/post";
import { Alert } from "@/models/alert";

export default {
    SET_THEME(state: State, theme: string) {
        state.theme = theme;
    },
    LOGIN(state: State) {
        state.authenticated = true;
    },
    LOGOUT(state: State) {
        state.authenticated = false;
        state.username = "";
    },
    async FETCH_POSTS(state: State, page: number) {
        const { data } = await axios.get(`http://localhost:3000/posts/${page}`);
        if (page === 1) {
            state.posts = data.posts as PostModel[];
            state.pages = data.pages as number;
        } else {
            const posts =  data.posts as PostModel[];
            for (const post of posts) {
                state.posts.push(post);
            }
        }
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
    EDIT_EDIT_CONTENT(state: State, text: string) {
        state.editContent = text;
    },
    EDIT_EDIT_TITLE(state: State, text: string) {
        state.editPostTitle = text;
    },
    SET_USERNAME(state: State, username: string) {
        state.username = username;
    },
    SET_ADMIN(state: State, admin: boolean) {
        state.isAdmin = admin;
    }
};
