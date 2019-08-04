import { State } from "@/models/state";

export default {
    getTheme(state: State) {
        return state.theme;
    },
    isAuthenticated(state: State) {
        return state.authenticated;
    },
    getContent(state: State) {
        return state.content;
    },
    getCommentContent(state: State) {
        return state.commentContent;
    },
    getPostTitle(state: State) {
        return state.postTitle;
    },
    getEditContent(state: State) {
        return state.editContent;
    },
    getEditTitle(state: State) {
        return state.editPostTitle;
    }
};
