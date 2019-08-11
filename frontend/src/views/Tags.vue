<template>
    <div class="tags">
        <div style="position: relative">
            <div
                style="display: inline-block;"
                v-for="(tag, index) in tags"
                :key="index"
                class="hashtag"
                @click="fooBar(tag)"
            >#{{tag}}</div>
        </div>
        <b-button v-if="show" @click="load" :variant="theme">Load More Tags</b-button>
        <p v-else-if="tags && tags.length === 0">No tags found.</p>
        <p v-else>All tags loaded.</p>
        <!-- I dont really know what to do for this. Maybe show users, posts, etc in paginated format?-->
    </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import PostBlock from "@/components/PostBlock.vue"; // @ is an alias to /src
import axios from "axios";
import { State } from "vuex-class";

@Component
export default class Tags extends Vue {
    protected currentPage: number;
    protected pages: number | null;
    protected tags: string[];

    constructor() {
        super();
        this.currentPage = 1;
        this.tags = [];
        this.pages = null;
    }

    get show() {
        return this.pages > this.currentPage;
    }

    protected mounted() {
        this.getData();
    }

    protected fooBar(tag) {
        this.$router.push(`/tag/${tag}`)
    }

    get theme() {
        return this.$store.getters.getTheme;
    }

    protected load() {
        this.currentPage += 1;
        this.getData();
    }

    protected async getData() {
        try {
            let { data } = await axios.get(
                `http://localhost:3000/tags/${this.currentPage}`
            );
            this.pages = data.pages;
            if (this.currentPage === 1) {
                this.tags = data.tags;
            } else {
                for (const tag of data.tags) {
                    this.tags.push(tag);
                }
            }
        } catch {
            console.log("f");
        }
    }
}
</script>

<style lang="sass" scoped>
.hashtag
    margin: 10px 
    padding-left: 5px
    padding-right: 5px
    padding-top: 5px
    padding-bottom: 5px 
    border-radius: 5px
    transition: 0.25s
    -webkit-transition: 0.25s
.hashtag:hover
    cursor: pointer
.dark
    .hashtag
        background-color: black !important
    .hashtag:hover
        color: #FF79c6
.light
    .hashtag
        background-color: white !important
    .hashtag:hover
        color: #00ccff
</style>