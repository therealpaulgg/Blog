import { State } from "@/models/state";

export default {
    SET_THEME(state: State, theme: string) {
        state.theme = theme;
    },
    LOGIN(state: State) {
        state.authenticated = true;
    },
    LOGOUT(state: State) {
        state.authenticated = false;
    }
}