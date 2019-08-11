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
import TagAndPosts from "./views/TagAndPosts.vue";
import Tags from "./views/Tags.vue";
import Notifications from "./views/Notifications.vue";

Vue.use(Router);

export default new Router({
    mode: "history",
    base: process.env.BASE_URL,
    routes: [
        {
            path: "/",
            name: "home",
            component: Home,
            meta: {
                title: "Home"
            }
        },
        {
            path: "/posts/:id/:title",
            name: "Posts",
            component: Post,
            props: true,
            meta: {
                title: "Post"
            }
        },
        {
            path: "/newpost",
            name: "newpost",
            component: NewPost,
            meta: {
                canPost: true,
                title: "New Post"
            }
        },
        {
            path: "/login",
            name: "login",
            component: Login,
            meta: {
                title: "Login"
            }
        },
        {
            path: "/register",
            name: "register",
            component: Register,
            meta: {
                noAuth: true,
                title: "Register"
            }
        },
        {
            path: "/initialsetup",
            name: "initialsetup",
            component: InitialSetup,
            meta: {
                initialSetup: true,
                title: "Initial Admin Setup"
            }
        },
        {
            path: "/administration",
            name: "administration",
            component: Administration,
            meta: {
                isAdmin: true,
                title: "Administration"
            }
        },
        {
            path: "/profile",
            name: "profile",
            component: Profile,
            meta: {
                requiresAuth: true,
                title: "Your Profile"
            }
        },
        {
            path: "/profile/:passedUser",
            name: "profileExplicit",
            component: Profile,
            props: true,
            meta: {
                title: "User Profile"
            }
        },
        {
            path: "/tag/:tag",
            name: "tagAndPosts",
            component: TagAndPosts,
            props: true,
            meta: {
                title: "Tag"
            }
        },
        {
            path: "/tags",
            name: "tags",
            component: Tags,
            meta: {
                title: "Tags"
            }
        },
        {
            path: "/notifications",
            name: "notifications",
            component: Notifications,
            meta: {
                title: "Notifications"
            }
        }
    ],
});
