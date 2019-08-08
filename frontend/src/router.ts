import Vue from "vue";
import Router from "vue-router";
import Home from "./views/Home.vue";
import Post from "./components/Post.vue";
import NewPost from "./views/NewPost.vue";
import Login from "./views/Login.vue";
import Register from "./views/Register.vue";
import InitialSetup from "./views/InitialSetup.vue";
import Administration from "./views/Administration.vue";
import Profile from "./views/Profile.vue";

Vue.use(Router);

export default new Router({
  mode: "history",
  base: process.env.BASE_URL,
  routes: [
    {
      path: "/",
      name: "home",
      component: Home,
    },
    {
        path: "/posts/:id/:title",
        name: "Posts",
        component: Post,
        props: true,
    },
    {
        path: "/newpost",
        name: "newpost",
        component: NewPost,
        meta: { canPost: true}
    },
    {
        path: "/login",
        name: "login",
        component: Login
    },
    {
        path: "/register",
        name: "register",
        component: Register,
        meta: { noAuth: true }
    },
    {
        path: "/initialsetup",
        name: "initialsetup",
        component: InitialSetup,
        meta: { initialSetup: true }
    },
    {
      path: "/administration",
      name: "administration",
      component: Administration,
      meta: { isAdmin: true }
    },
    {
      path: "/profile",
      name: "profile",
      component: Profile,
      meta: { requiresAuth: true }
    },
    {
        path: "/profile/:passedUser",
        name: "profileExplicit",
        component: Profile,
        props: true
    }
  ],
});
