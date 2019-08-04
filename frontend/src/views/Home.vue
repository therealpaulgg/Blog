<template>
    <div class="home">
        <PostBlock
            v-for="post in posts"
            :key="post.id"
            :title="post.title"
            :content="post.content"
            :urlTitle="post.urlTitle"
            :createdAt="post.createdAt"
            :updatedAt="post.updatedAt"
        ></PostBlock>
    </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import PostBlock from "@/components/PostBlock.vue"; // @ is an alias to /src
import axios from "axios";
import { PostModel } from "../models/post";
import { State } from "vuex-class";

@Component({
    components: {
        PostBlock
    }
})
export default class Home extends Vue {

    constructor() {
        super();
    }

    protected mounted() {
        this.$store.dispatch("fetchPosts");
    }

    get posts() {
        return this.$store.state.posts;
    }

    get theme() {
        return this.$store.getters.getTheme;
    }
}
</script>

<style lang="sass" scoped>
</style>
