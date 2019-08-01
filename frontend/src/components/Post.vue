<template>
    <div class="post">
        <div class="container">
            <router-link to="/">
                <font-awesome-icon style="margin-right: 10px" icon="arrow-left"></font-awesome-icon>Back to Home
            </router-link>
            <hr />
            <h1 class="bigtitle">{{header}}</h1>
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

@Component
export default class Post extends Vue {
    @Prop(String) readonly title!: string;
    @Getter("getTheme") getTheme: string;
    @Getter("isAuthenticated") isAuthenticated: boolean;

    header: string | null;
    content: string | null;

    constructor() {
        super();
        this.header = null;
        this.content = null;
    }

    del() {
        console.log(this.title);
        axios
            .post(
                "http://localhost:3000/delete",
                { url_title: this.title },
                { withCredentials: true }
            )
            .then(() => {
                this.$store.dispatch("fetchPosts")
                this.$router.push("/");
            }).catch(() => {
                this.$router.push("/");
            });
    }

    edit() {}

    async mounted() {
        let { data }: any = await axios.get(
            `http://localhost:3000/post/${this.title}`
        );
        this.header = data.title;
        this.content = data.content;
    }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="sass">
.bigtitle
    font-size: 50px
    margin-bottom: 20px
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
