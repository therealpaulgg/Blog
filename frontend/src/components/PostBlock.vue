<template>
    <div
        class="postblock"
        :class="{'light': getTheme === 'light', 'dark': getTheme === 'dark', 'condensed': condensed}"
        @click="goToPost"
    >
        <p style="float: right;" :class="{'lessnoticed':condensed}">
            <span v-if="!condensed">
                by
                <b v-if="username === author">
                    <a @click.stop="gotoUser(author)">you</a>
                </b>
                <b v-else>
                    <a @click.stop="gotoUser(author)">{{author}}</a>
                </b>
                ,
            </span>
            {{date}}
        </p>
        <div style="position: relative; word-wrap: break-word;">
            <h2 v-if="!condensed">{{title}}</h2>
            <h3 v-else>{{title}}</h3>
        </div>
        <div style="position: relative" v-if="!condensed">
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
    @Prop() condensed: boolean;
    @Getter("getTheme") private getTheme: string;

    get date() {
        return `${moment
            .utc(this.createdAt)
            .local()
            .format("MM/DD/YYYY, HH:mm")}, ${moment
            .utc(this.createdAt)
            .fromNow()}`;
    }

    get username() {
        return this.$store.state.username;
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
.postblock.condensed
    padding: 10px 10px 1px 10px
    border-radius: 10px
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
.postblock.condensed:hover
    border-radius: 20px
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
.lessnoticed
    font-style: italic
    
.dark
    .lessnoticed
        color: #d5d5d5
    .hashtag
        background-color: black !important
    .hashtag:hover
        color: #FF79c6
.light
    .lessnoticed
        color: #787878
    .hashtag
        background-color: #e9ecef !important
    .hashtag:hover
        color: #00ccff
</style>
