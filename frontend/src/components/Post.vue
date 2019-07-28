<template>
    <div class="post">
        <div class="container">
            <router-link to="/">
                <font-awesome-icon style="margin-right: 10px" icon="arrow-left"></font-awesome-icon>Back to Home
            </router-link>
            <hr />
            <h1 class="bigtitle">{{header}}</h1>
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

    header: string | null;
    content: string | null;

    constructor() {
        super();
        this.header = null;
        this.content = null;
    }

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
</style>
