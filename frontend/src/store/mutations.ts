import { State } from "@/models/state";
import axios from "axios";
import { PostModel } from "@/models/post";

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
        state.content = text
    }
};
