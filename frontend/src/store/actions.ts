export default {
    setTheme({ commit }: { commit: any }, theme: string) {
        commit("SET_THEME", theme);
    }
}