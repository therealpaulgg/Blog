import Vue from "vue";
import Router from "vue-router";
import Home from "./views/Home.vue";
import Post from "./components/Post.vue";
import NewPost from "./views/NewPost.vue";
import Login from "./views/Login.vue";
import Register from "./views/Register.vue";
import InitialSetup from "./views/InitialSetup.vue";

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
        component: Register
    },
    {
        path: "/initialsetup",
        name: "initialsetup",
        component: InitialSetup,
        meta: { initialSetup: true }
    }
  ],
});
