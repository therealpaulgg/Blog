import Cookies from "js-cookie"
import axios from "axios"
import store from "./store/store"
import router from "./router"

import { close, connect } from "./websocket"

export async function determineTokenRefreshInterval() {
    try {
        const expiry = parseInt(Cookies.get("expiration"), 10)
        const authCookie = Cookies.get("auth")
        if (isNaN(expiry) || authCookie == null) {
            store.commit("LOGOUT")
            close()
            router.push("/login")
            store.dispatch("addAlert", {
                alertType: "danger",
                alertText:
                    "Your login session has expired. Please log in again."
            })
        } else {
            connect()
            const timeout = expiry - new Date().getTime()
            const delay = 10000
            if (timeout - delay > 0) {
                setTimeout(async () => {
                    try {
                        await axios.post(
                            `${process.env.VUE_APP_API_URL}/renew-jwt`,
                            {},
                            { withCredentials: true }
                        )
                        determineTokenRefreshInterval()
                    } catch {
                        // the timeout dies here if they aren't logged in (lazy I know)
                        if (store.state.authenticated) {
                            store.commit("LOGOUT")
                            close()
                            router.push("/login")
                            store.dispatch("addAlert", {
                                alertType: "danger",
                                alertText:
                                    "Your login session has expired, please log in again."
                            })
                        }
                    }
                }, timeout - delay)
            } else {
                await axios.post(
                    `${process.env.VUE_APP_API_URL}/renew-jwt`,
                    {},
                    { withCredentials: true }
                )
                determineTokenRefreshInterval()
            }
        }
    } catch (err) {
        store.commit("LOGOUT")
        close()
        store.dispatch("addAlert", {
            alertType: "danger",
            alertText:
                "Your login session has expired, please log in again."
        })
    }
}
