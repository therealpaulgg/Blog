<template>
    <div id="preview">
        <div class="break" v-html="`<h1>${renderedTitle}</h1>` + renderedContent"></div>
        <br />
    </div>
</template>

<script lang="ts">
import { Component, Vue, Watch, Prop } from "vue-property-decorator"
import { mdHtml, mdNoHtml } from "../mdparser"

@Component
export default class Preview extends Vue {
    protected renderedContent: string
    protected renderedTitle: string
    @Prop(String) protected content: string
    @Prop(String) protected title: string
    @Prop(Boolean) protected useHtml: boolean

    constructor() {
        super()
        this.renderedContent = ""
        this.renderedTitle = this.title ? this.title : ""
        if (this.content) {
            this.renderedContent = this.useHtml ? mdHtml.render(this.content) : mdNoHtml.render(this.content)
        } else {
            this.content = ""
        }
    }

    @Watch("title")
    protected renderTitle() {
        this.renderedTitle = this.title ? this.title : ""
    }

    @Watch("content")
    protected test(val: string, oldVal: string) {
        try {
            this.renderedContent = this.useHtml ? mdHtml.render(this.content) : mdNoHtml.render(this.content)
        } catch (err) {
            // TODO: error handling
            // console.error(err)
        }
    }
}
</script>

<style scoped lang="sass">
@import "../assets/sass/variables.sass"
.title
    border-radius: 5px    
.break
    position: absolute
    width: 100%
    word-wrap: break-word
    margin: 0px
    padding: 20px
.dark
    .title
        border-radius: 5px
        border-color: $darkfg !important
        background-color: $darkbg !important
.light
    .title
        border-color: white !important
        background-color: white !important
</style>