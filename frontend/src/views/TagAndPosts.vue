<template>
    <div class="tagandposts container">
        <PostBlock
            v-for="post in posts"
            :key="post.postId"
            :post="post"
        ></PostBlock>
        <b-button v-if="show" @click="load" :variant="theme">Load More Posts</b-button>
        <p v-else-if="posts && posts.length === 0">No posts found.</p> 
        <p v-else>All posts loaded.</p>
    </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from "vue-property-decorator"
import PostBlock from "@/components/PostBlock.vue" // @ is an alias to /src
import axios from "axios"
import { State } from "vuex-class"
import {BButton} from "bootstrap-vue"

@Component({
    components: {
        PostBlock,
        BButton
    }
})
export default class TagAndPosts extends Vue {
    @Prop(String) protected tag: string
    protected pageNum: number

    constructor() {
        super()
        this.pageNum = 1
    }

    get show() {
        return this.$store.state.tagPages > this.pageNum
    }

    get posts() {
        return this.$store.state.tagPosts
    }

    get theme() {
        return this.$store.getters.getTheme
    }

    protected mounted() {
        this.$store.dispatch("fetchTagPosts", {page: this.pageNum, tag: this.tag})
    }

    protected load() {
        this.pageNum += 1
        this.$store.dispatch("fetchTagPosts", {page: this.pageNum, tag: this.tag})
    }
}
</script>

<style lang="sass" scoped>
</style>
