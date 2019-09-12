import Vue from "vue"
import App from "./App.vue"
import router from "./router"
import store from "./store/store"
// import BootstrapVue from "bootstrap-vue"
import VueShortkey from "vue-shortkey"
import axios from "axios"


import { library } from "@fortawesome/fontawesome-svg-core"
import {
    faMoon,
    faSun,
    faArrowLeft,
    faLink,
    faPaperclip,
    faCode,
    faFileCode,
    faHeading,
    faBold,
    faItalic,
    faQuoteLeft,
    faUnderline,
    faCalculator,
    faComments,
    faCalendarAlt,
    faSyncAlt,
    faUser,
    faUserShield,
    faUserEdit,
    faUsersCog,
    faUserSecret,
    faTimesCircle,
    faBell,
    faClipboard,
    faEllipsisH,
    faShareSquare,
    faEye,
    faKey
} from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome"

library.add(
    faMoon,
    faSun,
    faArrowLeft,
    faLink,
    faPaperclip,
    faCode,
    faFileCode,
    faHeading,
    faBold,
    faItalic,
    faQuoteLeft,
    faUnderline,
    faCalculator,
    faComments,
    faCalendarAlt,
    faSyncAlt,
    faUser,
    faUserShield,
    faUserEdit,
    faUsersCog,
    faUserSecret,
    faTimesCircle,
    faBell,
    faClipboard,
    faEllipsisH,
    faShareSquare,
    faEye,
    faKey
)

Vue.component("font-awesome-icon", FontAwesomeIcon)

Vue.config.productionTip = false

// Vue.use(BootstrapVue)
Vue.use(VueShortkey)

// Thank you very much for this
// https://medium.com/@Taha_Shashtari/an-easy-way-to-detect-clicks-outside-an-element-in-vue-1b51d43ff634

let handleOutsideClick

Vue.directive("closable", {
    bind(el, binding, vnode) {
        // Here's the click/touchstart handler
        // (it is registered below)
        handleOutsideClick = (e) => {
            e.stopPropagation()
            // Get the handler method name and the exclude array
            // from the object used in v-closable
            const { handler, exclude } = binding.value
            // This variable indicates if the clicked element is excluded
            let clickedOnExcludedEl = false
            if (exclude != null) {
                exclude.forEach((refName) => {
                    // We only run this code if we haven't detected
                    // any excluded element yet
                    if (!clickedOnExcludedEl) {
                        // Get the element using the reference name
                        const excludedEl = vnode.context.$refs[refName]
                        // See if this excluded element
                        // is the same element the user just clicked on
                        clickedOnExcludedEl = excludedEl.contains(e.target)
                    }
                })
            }
            // We check to see if the clicked element is not
            // the dialog element and not excluded
            if (!el.contains(e.target) && !clickedOnExcludedEl) {
                // If the clicked element is outside the dialog
                // and not the button, then call the outside-click handler
                // from the same component this directive is used in
                vnode.context[handler]()
            }
        }
        // Register click/touchstart event listeners on the whole page
        document.addEventListener("click", handleOutsideClick)
        document.addEventListener("touchstart", handleOutsideClick)
    },
    unbind() {
        // If the element that has v-closable is removed, then
        // unbind click/touchstart listeners from the whole page
        document.removeEventListener("click", handleOutsideClick)
        document.removeEventListener("touchstart", handleOutsideClick)
    }
})

import "../node_modules/bootstrap/dist/css/bootstrap.css"
import "../node_modules/bootstrap-vue/dist/bootstrap-vue.css"


router.beforeEach(async (to, from, next) => {
    if (to.matched.some((record) => record.meta.requiresAuth)) {
        if (!store.state.authenticated) {
            next({
                path: "/login",
                query: { redirect: to.fullPath }
            })
        } else {
            next()
        }
    } else if (to.matched.some((record) => record.meta.noAuth)) {
        if (store.state.authenticated) {
            next("/")
        } else {
            next()
        }
    } else if (to.matched.some((record) => record.meta.initialSetup)) {
        try {
            const { data } = await axios.get(`${process.env.VUE_APP_API_URL}/cansetup`)
            const canSetup = data.canSetup
            if (!canSetup) {
                next("/")
            } else {
                next()
            }
        } catch (__) {
            next("/")
        }
    } else if (to.matched.some((record) => record.meta.canPost)) {
        try {
            const { data } = await axios.get(`${process.env.VUE_APP_API_URL}/canpost`, { withCredentials: true })
            const canPost = data.canPost
            if (!canPost) {
                next("/")
            } else {
                next()
            }
        } catch (__) {
            next("/")
        }
    } else if (to.matched.some((record) => record.meta.isAdmin)) {
        try {
            const { data } = await axios.get(`${process.env.VUE_APP_API_URL}/isadmin`, { withCredentials: true })
            const isAdmin = data.isAdmin
            if (!isAdmin) {
                next("/")
            } else {
                next()
            }
        } catch (__) {
            next("/")
        }
    } else {
        next()
    }
})

const title = "Blog"
router.afterEach((to, from) => document.title = `${to.meta.title} | ${title}` || title)

new Vue({
    router,
    store,
    render: (h) => h(App),
}).$mount("#app")
