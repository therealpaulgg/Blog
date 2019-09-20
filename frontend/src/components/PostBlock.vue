<template>
    <div
        class="postblock betterscrollbar"
        tabindex="0"
        :class="{'light': getTheme === 'light', 'dark': getTheme === 'dark', 'condensed': condensed}"
        @click="goToPost"
        @keyup.enter="goToPost"
        
    >
        <div class="lessnoticed">
            <span v-if="!condensed">
                by
                <b v-if="username === post.username">
                    <a @click.stop="gotoUser(post.username)">you,</a>
                </b>
                <b v-else>
                    <a @click.stop="gotoUser(post.username)">{{post.username}},</a>
                </b>
            </span>
            <span class="metaelement">
                <font-awesome-icon icon="calendar-alt"></font-awesome-icon>
                <span class="metaelement">
                    {{date}},
                    <i>{{createdFrom}}</i>
                </span>
            </span>
            <span class="metaelement">
                <font-awesome-icon icon="globe" v-if="post.visibility === 'public'"></font-awesome-icon>
                <font-awesome-icon icon="key" v-if="post.visibility === 'login_only'"></font-awesome-icon>
                <font-awesome-icon icon="eye-slash" v-if="post.visibility === 'private'"></font-awesome-icon>
            </span>
            <span class="metaelement">
                <font-awesome-icon icon="hourglass-half"></font-awesome-icon>
                {{post.readingTime}}
            </span>
        </div>
        <div style="position: relative; word-wrap: break-word">
            <h2 v-if="!condensed">{{post.title}}</h2>
            <h3 v-else>{{post.title}}</h3>
            <div v-if="post.content" v-html="mdNoHtml.render(post.content)"></div>
        </div>
        <div style="position: relative" v-if="!condensed">
            <button
                style="display: inline-block"
                v-for="(tag, index) in post.tags"
                :key="index"
                class="hashtag"
                @click.stop="fooBar(tag)"
            >#{{tag}}</button>
        </div>
    </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator"
import { Getter } from "vuex-class"
import moment from "moment"
import { mdNoHtml } from "../mdparser"
import { PostModel } from "../models/post"

@Component
export default class PostBlock extends Vue {

    @Prop() public condensed: boolean
    @Prop() protected readonly post: PostModel
    protected mdNoHtml = mdNoHtml
    @Getter("getTheme") private getTheme: string

    protected fooBar(tag) {
        this.$router.push(`/tag/${tag}`)
    }

    protected goToPost() {
        this.$router.push(`/posts/${this.post.postId}/${this.post.urlTitle}`)
    }

    protected gotoUser(user) {
        this.$router.push(`/profile/${user}`)
    }

    protected get date() {
        return `${moment
            .utc(this.post.createdAt)
            .local()
            .format("MM/DD/YYYY, HH:mm")}`
    }

    protected get createdFrom() {
        return `${moment.utc(this.post.createdAt).fromNow()}`
    }

    protected get username() {
        return this.$store.state.username
    }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="sass">
@import "../assets/sass/variables.sass"
.postblock
    padding: 20px
    margin: 10px
    border-radius: 20px
    transition: 0.5s
    -webkit-transition: 0.5s
    overflow: auto
    max-height: 250px
    border-color: rgba(0,0,0,0)
    width: 100%
    text-align: left
.postblock.condensed
    padding: 10px 10px 1px 10px
    border-radius: 10px
.postblock.dark
    color: $darktext
    background-color: $darkfg !important
.postblock.dark:hover
    background-color: $darkelehover !important
.postblock.light    
    background-color: $lightfg !important
    color: $lighttext
.postblock.light:hover
    background-color: $lightelehover !important
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
.metaelement
    margin-left: 10px
    margin-right: 10px
.hashtag
    margin: 10px 
    padding-left: 5px
    padding-right: 5px
    padding-top: 5px
    padding-bottom: 5px 
    border-color: rgba(0,0,0,0)
    border-radius: 5px
    transition: 0.25s
    -webkit-transition: 0.25s
.dark
    .lessnoticed
        color: $darklessnoticed
    .hashtag
        background-color: $darkhashtagbg !important
        color: $darktext
    .hashtag:hover
        color: $darkhover
.light
    .lessnoticed
        color: $lightlessnoticed
    .hashtag
        background-color: $lighthashtagbg !important
        color: $lighttext
    .hashtag:hover
        color: $lighthover
</style>
