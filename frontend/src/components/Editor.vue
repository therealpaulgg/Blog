<template>
    <div class="editor">
        <PostToolbar :editor="this.editor" />
        <div id="monacoeditor"></div>
        <MonacoEditor
            ref="editor"
            class="editor"
            language="markdown"
            v-model="content"
            :theme="vsTheme"
            :options="options"
            :width="width"
        />
    </div>
</template>
<script lang="ts">
import { Component, Vue, Watch, Prop } from "vue-property-decorator";
import axios from "axios";
import MonacoEditor from "vue-monaco";
import dracula from "../assets/Dracula.json";
import { MonacoWindow } from "../interfaces/window";
import PostToolbar from "../components/PostToolbar.vue";

@Component({
    components: {
        MonacoEditor,
        PostToolbar
    }
})
export default class NewPost extends Vue {
        public $refs: {
        editcol: HTMLDivElement;
        editor: any;
    };
    @Prop(Number) protected height: number;
    @Prop(Number) protected width: number;
    @Prop(String) protected initialContent: string;
    protected content: string;
    protected ready = false;
    protected editor = null;
    private options = {
        fontLigatures: true,
        fontFamily: "Fira Code",
        wordWrap: true,
        minimap: { enabled: false }
    };

    constructor() {
        super();
        if (this.initialContent) {
            this.content = this.initialContent;
        } else {
            this.content = "";
        }
    }

    public updateDimensions() {
        const height = this.height - 46;
        const width = this.width;
        this.editor.getEditor().layout({ height, width });
    }

    @Watch("width")
    protected updateWidth() {
        this.updateDimensions();
    }

    @Watch("height")
    protected updateHeight() {
        this.updateDimensions();
    }

    @Watch("content")
    protected send() {
        this.$emit("input", this.content);
    }

    // I don't really care if this is inefficient, I've spend like 2 hours on
    // this stupid issue of persisted state, and all I know is that if I use
    // this it resets a text box after the properties are cleared properly.
    @Watch("initialContent")
    protected foo() {
        this.content = this.initialContent;
    }

    protected mounted() {
        const extWindow: MonacoWindow = window;
        extWindow.monaco.editor.defineTheme("dracula", dracula);
        extWindow.monaco.editor.setTheme(this.vsTheme);
        this.editor = this.$refs.editor;
        this.updateDimensions();
    }

    get theme() {
        return this.$store.getters.getTheme;
    }

    get vsTheme() {
        const theme = this.$store.getters.getTheme;
        return theme === "dark" ? "dracula" : "vs-light";
    }
}
</script>

<style scoped lang="sass">
</style>
