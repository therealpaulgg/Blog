<template>
    <div
        class="postblock betterscrollbar"
        :class="{'light': getTheme === 'light', 'dark': getTheme === 'dark', 'condensed': condensed}"
        @click="goToPost"
    >
        <div class="lessnoticed">
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
            <span class="metaelement">
                <font-awesome-icon icon="calendar-alt"></font-awesome-icon>
                <span class="metaelement">
                    {{date}},
                    <i>{{createdFrom}}</i>
                </span>
            </span>
            <span class="metaelement">
                <font-awesome-icon icon="eye" v-if="visibility === 'public'"></font-awesome-icon>
                <font-awesome-icon icon="key" v-if="visibility === 'login_only'"></font-awesome-icon>
                <font-awesome-icon icon="user-secret" v-if="visibility === 'private'"></font-awesome-icon>
            </span>
        </div>
        <div style="position: relative; word-wrap: break-word">
            <h2 v-if="!condensed">{{title}}</h2>
            <h3 v-else>{{title}}</h3>
            <div v-if="content" v-html="mdNoHtml.render(content)"></div>
        </div>
        <div style="position: relative" v-if="!condensed">
            <div
                style="display: inline-block"
                v-for="(tag, index) in tags"
                :key="index"
                class="hashtag"
                @click.stop="fooBar(tag)"
            >#{{tag}}</div>
        </div>
    </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator"
import { Getter } from "vuex-class"
import moment from "moment"
import { mdNoHtml } from "../mdparser"

@Component
export default class PostBlock extends Vue {

    @Prop() public condensed: boolean
    @Prop(Number) protected readonly id!: number
    @Prop(String) protected readonly title!: string
    @Prop(String) protected readonly content!: string
    @Prop(String) protected readonly author!: string
    @Prop(String) protected readonly urlTitle!: string
    @Prop(String) protected readonly createdAt: string
    @Prop(String) protected readonly updatedAt: string
    @Prop(String) protected readonly visibility: string
    @Prop() protected readonly tags: string[]
    protected mdNoHtml = mdNoHtml
    @Getter("getTheme") private getTheme: string

    protected fooBar(tag) {
        this.$router.push(`/tag/${tag}`)
    }

    protected goToPost() {
        this.$router.push(`/posts/${this.id}/${this.urlTitle}`)
    }

    protected gotoUser(user) {
        this.$router.push(`/profile/${user}`)
    }

    protected get date() {
        return `${moment
            .utc(this.createdAt)
            .local()
            .format("MM/DD/YYYY, HH:mm")}`
    }

    protected get createdFrom() {
        return `${moment.utc(this.createdAt).fromNow()}`
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
    margin: 20px
    border-radius: 20px
    transition: 0.5s
    -webkit-transition: 0.5s
    overflow: auto
    max-height: 250px
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
    border-radius: 5px
    transition: 0.25s
    -webkit-transition: 0.25s
.dark
    .lessnoticed
        color: $darklessnoticed
    .hashtag
        background-color: $darkhashtagbg !important
    .hashtag:hover
        color: $darkhover
.light
    .lessnoticed
        color: $lightlessnoticed
    .hashtag
        background-color: $lighthashtagbg !important
    .hashtag:hover
        color: $lighthover
</style>
