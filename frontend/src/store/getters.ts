import { State } from "@/models/state";

export default {
    getTheme(state: State) {
        return state.theme;
    },
    isAuthenticated(state: State) {
        return state.authenticated;
    }
};
