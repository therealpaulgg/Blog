export default {
    setTheme({ commit }: { commit: any }, theme: string) {
        commit("SET_THEME", theme);
    },
    login({ commit }: { commit: any }) {
        commit("LOGIN");
    },
    logout({ commit }: { commit: any }) {
        commit("LOGOUT");
    },
    fetchPosts({ commit }: { commit: any}) {
        commit("FETCH_POSTS");
    },
    editContent({ commit }: { commit: any}, text: string) {
        commit("EDIT_CONTENT", text);
    },
    editCommentContent({ commit }: { commit: any}, text: string) {
        commit("EDIT_COMMENT_CONTENT", text);
    }
};
