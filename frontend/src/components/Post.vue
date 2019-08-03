<template>
    <div class="post">
        <div class="container">
            <router-link to="/">
                <font-awesome-icon style="margin-right: 10px" icon="arrow-left"></font-awesome-icon>Back to Home
            </router-link>
            <hr />
            <h1 class="bigtitle">{{title}}</h1>
            <p>by {{user}}</p>
            <p>Created {{createdAt}}</p>
            <p v-if="createdAt !== updatedAt">Updated {{updatedAt}}</p>
            <div v-if="isAuthenticated">
                <a @click="del" class="delete" :class="getTheme">Delete</a>
                <a @click="edit" class="edit" :class="getTheme">Edit</a>
            </div>
            <hr />
            <!-- <p v-if="title == 'foo'">CYKA BLYAD</p> -->
            <div v-html="content"></div>
        </div>
    </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";
import axios from "axios";
import { Getter } from "vuex-class";
import moment from "moment";
import { PostModel } from "../models/post";

@Component
export default class Post extends Vue {
    protected header: string | null;
    protected content: string | null;
    protected user: string | null;
    protected createdAt: any;
    protected updatedAt: any;
    @Prop(String) protected readonly title!: string;
    @Getter("getTheme") private getTheme: string;
    @Getter("isAuthenticated") private isAuthenticated: boolean;

    constructor() {
        super();
        this.header = null;
        this.content = null;
        this.user = null;
        this.createdAt = null;
        this.updatedAt = null;
    }

    protected del() {
        axios
            .post(
                "http://localhost:3000/delete",
                { urlTitle: this.title },
                { withCredentials: true }
            )
            .then(() => {
                this.$store.dispatch("fetchPosts");
                this.$router.push("/");
            })
            .catch(() => {
                this.$router.push("/");
            });
    }

    protected edit() {
        // TODO
    }

    protected async mounted() {
        const { data }: {data: PostModel} = await axios.get(
            `http://localhost:3000/post/${this.title}`
        );
        this.header = data.title;
        this.content = data.content;
        this.user = data.username;
        this.createdAt = moment.utc(data.createdAt).local().format("MM/DD/YYYY, HH:MM");
        this.updatedAt = moment.utc(data.updatedAt).local().format("MM/DD/YYYY, HH:MM");
    }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="sass">
.bigtitle
    font-size: 50px
    margin-bottom: 20px
    margin-right: 10px
    word-wrap: break-word
    white-space: normal
    width: 100%
.delete
    color: #ff7474 !important
    cursor: pointer
    border-radius: 5px
    padding: 10px
    margin-top: 10px
    width: auto
    height: auto
.delete.light
    background-color: white !important
.delete.dark
    background-color: #2a2c39 !important
.edit
    color: #75ff74 !important
    cursor: pointer
    border-radius: 5px
    padding: 10px
    margin: 10px
.edit.light
    background-color: white !important
.edit.dark
    background-color: #2a2c39 !important
</style>
