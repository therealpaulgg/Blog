<template>
    <div id="preview">
        <div class="break" v-html="`<h1>${renderedTitle}</h1>` + renderedContent"></div>
        <br />
    </div>
</template>

<script lang="ts">
import { Component, Vue, Watch, Prop } from "vue-property-decorator"
import { md } from "../mdparser"

@Component
export default class Preview extends Vue {
    protected renderedContent: string
    protected renderedTitle: string
    @Prop(String) protected content: string
    protected localContent: string
    @Prop(String) private title: string

    constructor() {
        super()
        this.renderedContent = ""
        this.renderedTitle = this.title ? this.title : ""
        if (this.content) {
            this.localContent = this.content
            this.renderedContent = md.render(this.localContent)
        } else {
            this.localContent = ""
        }
    }

    @Watch("title")
    protected renderTitle() {
        this.renderedTitle = this.title ? this.title : ""
    }

    @Watch("content")
    protected test(val: string, oldVal: string) {
        try {
            this.renderedContent = md.render(val)
        } catch (err) {
            // TODO: error handling
            // console.error(err)
        }
    }
}
</script>

<style scoped lang="sass">
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
        border-color: #2a2c39 !important
        background-color: #20212B !important
.light
    .title
        border-color: white !important
        background-color: white !important
</style>