<template>
    <div class="postblock" :class="getTheme" @click="goToPost">
        <p style="float: right;">
            by
            <i>
                <a @click.stop="gotoUser(author)">{{author}}</a>
            </i>
            , {{date}}
        </p>
        <h1>{{title}}</h1>
        <div style="position: relative">
            <div
                style="display: inline-block;"
                v-for="(tag, index) in tags"
                :key="index"
                class="hashtag"
                @click.stop="fooBar(tag)"
            >#{{tag}}</div>
        </div>
    </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";
import { Getter } from "vuex-class";
import moment from "moment";

@Component
export default class PostBlock extends Vue {
    @Prop(Number) protected readonly id!: number;
    @Prop(String) protected readonly title!: string;
    @Prop(String) protected readonly content!: string;
    @Prop(String) protected readonly author!: string;
    @Prop(String) protected readonly urlTitle!: string;
    @Prop(String) protected readonly createdAt: string;
    @Prop(String) protected readonly updatedAt: string;
    @Prop() protected readonly tags: string[];
    @Getter("getTheme") private getTheme: string;

    get date() {
        return `${moment
            .utc(this.createdAt)
            .local()
            .format("MM/DD/YYYY, HH:mm")}, ${moment.utc(this.createdAt).fromNow()}`;
    }

    protected fooBar(tag) {
        this.$router.push(`/tag/${tag}`);
    }

    protected goToPost() {
        this.$router.push(`/posts/${this.id}/${this.urlTitle}`);
    }

    protected gotoUser(user) {
        this.$router.push(`/profile/${user}`);
    }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="sass">
.postblock
    padding: 20px
    margin: 20px
    border-radius: 20px
    transition: 0.5s
    -webkit-transition: 0.5s
.postblock.dark
    color: white
    background-color: #2a2c39 !important
.postblock.dark:hover
    background-color: #3e4154 !important
.postblock.light    
    background-color: white !important
    color: black
.postblock.light:hover
    background-color: #f2feff !important
.postblock:hover
    border-radius: 50px
    transition: 0.5s
    -webkit-transition: 0.5s
    cursor: pointer
.hashtag
    margin: 10px 
    padding-left: 5px
    padding-right: 5px
    padding-top: 5px
    padding-bottom: 5px 
    border-radius: 5px
    transition: 0.25s
    -webkit-transition: 0.25s
.dark
    .hashtag
        background-color: black !important
    .hashtag:hover
        color: #FF79c6
.light
    .hashtag
        background-color: #e9ecef !important
    .hashtag:hover
        color: #00ccff
</style>
