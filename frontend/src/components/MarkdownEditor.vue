<template>
    <div class="row">
        <div style="width: 50%; height: auto" class="col">
            <Editor :height="height" :width="width" v-model="localContent" :initialContent="localContent" />
        </div>
        <div style="width: 50%; height: auto" class="col preview" ref="editcol" :class="theme">
            <Preview :title="title" :content="localContent" :useHtml="useHtml"/>
        </div>
    </div>
</template>

<script lang="ts">
import { State, Getter, Action } from "vuex-class"
import { Component, Prop, Vue, Watch } from "vue-property-decorator"
import Editor from "./Editor.vue"
import Preview from "./Preview.vue"

@Component({
    components: {
        Editor,
        Preview
    }
})
export default class MarkdownEditor extends Vue {
    @Prop(String) protected content: string
    @Prop(String) protected initialContent: string
    @Prop(String) protected title: string
    @Prop(String) protected height: string
    @Prop(String) protected width: string
    @Prop(Boolean) protected useHtml: boolean
    @Getter("getTheme") protected theme: string
    protected localContent: string

    constructor() {
        super()
        this.localContent = this.initialContent
    }

    @Watch("localContent")
    protected send() {
        this.$emit("input", this.localContent)
    }

}
</script>

<style lang="sass" scoped>
@import "../assets/sass/variables.sass"
.preview
    padding: 0px
    border-radius: 5px
    overflow-y: auto
.dark
    .preview
        background-color: $darkfg !important
.light
    .preview
        background-color: #FFFFFE !important
</style>