<template>
    <div class="home">
        <PostBlock
            v-for="post in posts"
            :key="post.postId"
            :title="post.title"
            :content="post.content"
            :urlTitle="post.urlTitle"
            :createdAt="post.createdAt"
            :updatedAt="post.updatedAt"
            :id="post.postId"
            :author="post.username"
        ></PostBlock>
        <b-button v-if="show" @click="load" :variant="theme">Load More Posts</b-button>
        <p v-else-if="posts && posts.length === 0">No posts found.</p> 
        <p v-else>All posts loaded.</p>
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

    protected pageNum: number;

    constructor() {
        super();
        this.pageNum = 1;
    }

    protected mounted() {
        this.$store.dispatch("fetchPosts", this.pageNum);
    }

    protected load() {
        this.pageNum += 1;
        this.$store.dispatch("fetchPosts", this.pageNum);
    }

    get show() {
        return this.$store.state.pages > this.pageNum;
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
