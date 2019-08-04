<template>
    <div class="toolbar">
        <font-awesome-icon
            class="icon"
            style="position: relative"
            icon="link"
            @click="toggle(0)"
            ref="linkbtn"
        ></font-awesome-icon>
        <img
            class="icon emoji"
            draggable="false"
            alt="😃"
            @click="toggle(1)"
            src="https://twemoji.maxcdn.com/v/12.1.2/72x72/1f603.png"
            ref="emojibtn"
        />
        <div class="popup" v-if="popups[1]">
            <picker
                v-closable="{
                        exclude: refs,
                        handler: 'closeAll'
                    }"
                set="twitter"
                @select="addEmoji"
                title="Emoji Picker"
                :style="getStyle"
                color="white"
            />
        </div>
        <font-awesome-icon class="icon" icon="code" ref="codebtn" @click="toggle(2)"></font-awesome-icon>

        <div
            class="popup"
            v-if="popups[2]"
            v-closable="{
                        exclude: refs,
                        handler: 'closeAll'
                    }"
        >
            <p>Language</p>
            <input type="text" class="infield" v-model="language" />
            <br />
            <button style="margin-top: 10px" @click="addCode">Add</button>
        </div>
        <font-awesome-icon class="icon" icon="file-code" ref="htmlbtn" @click="toggle(3)"></font-awesome-icon>
        <div
            class="popup"
            v-if="popups[3]"
            v-closable="{
                        exclude: refs,
                        handler: 'closeAll'
                    }"
        >
            <p>Hey! Markdown is a superset of HTML! Just paste your HTML (and even inline CSS styles) into the editor!</p>
        </div>
        <font-awesome-icon class="icon" icon="heading" ref="headerbtn" @click="toggle(4)"></font-awesome-icon>
        <font-awesome-icon
            class="icon"
            icon="bold"
            ref="boldbtn"
            @click="toggle(5)"
            v-shortkey="['ctrl', 'b']"
            @shortkey="toggle(5)"
        ></font-awesome-icon>
        <font-awesome-icon
            class="icon"
            icon="italic"
            ref="italicbtn"
            @click="toggle(6)"
            v-shortkey="['ctrl', 'i']"
            @shortkey="toggle(6)"
        ></font-awesome-icon>
        <font-awesome-icon
            class="icon"
            icon="underline"
            ref="underlinebtn"
            @click="toggle(7)"
            v-shortkey="['ctrl', 'u']"
            @shortkey="toggle(7)"
        ></font-awesome-icon>
        <font-awesome-icon class="icon" icon="quote-left" ref="quotebtn" @click="toggle(8)"></font-awesome-icon>
        <font-awesome-icon class="icon" icon="calculator" ref="mathbtn" @click="toggle(9)"></font-awesome-icon>
    </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";
import { Picker } from "emoji-mart-vue-fast";
import "../assets/css/emoji-mart.css";
import monaco from "monaco-editor";
import { MonacoWindow } from "../interfaces/window";

@Component({
    components: {
        Picker
    }
})
export default class PostToolbar extends Vue {
    @Prop() protected editor: any;
    protected popups: boolean[];
    protected functions: Array<{ function: (...args) => any; args: any[] }>;
    protected POPUP_NUM = 10;
    protected url: string;
    protected name: string;
    protected language: string;
    protected refs = [
        "linkbtn",
        "emojibtn",
        "codebtn",
        "htmlbtn",
        "headerbtn",
        "boldbtn",
        "italicbtn",
        "underlinebtn",
        "quotebtn"
    ];

    constructor() {
        super();
        this.url = "";
        this.name = "";
        this.language = "";
        this.popups = [];
        this.functions = [
            { function: this.makeLink, args: [] },
            null,
            null,
            null,
            { function: this.styleText, args: ["## ", ""] },
            { function: this.styleText, args: ["**", "**"] },
            { function: this.styleText, args: ["*", "*"] },
            { function: this.styleText, args: ["<u>", "</u>"] },
            { function: this.styleText, args: ["> ", ""] },
            { function: this.styleText, args: ["$", "$"] }
        ];
        for (let i = 0; i < this.POPUP_NUM; i++) {
            Vue.set(this.popups, i, false);
        }
    }

    public closeAll() {
        for (let i = 0; i < this.POPUP_NUM; i++) {
            Vue.set(this.popups, i, false);
        }
    }

    protected toggle(index) {
        for (let i = 0; i < this.POPUP_NUM; i++) {
            if (i === index) {
                Vue.set(this.popups, i, !this.popups[i]);
                const fn = this.functions[i].function;
                if (fn !== null) {
                    const args = this.functions[i].args;
                    this.insertMonaco(fn, args);
                }
            } else {
                Vue.set(this.popups, i, false);
            }
        }
    }

    protected insertMonaco(fn: (...args) => any, args: any[]) {
        const line = this.editor.getEditor().getSelection();
        const extWindow: MonacoWindow = window;
        const range = new extWindow.monaco.Range(
            line.startLineNumber,
            line.startColumn,
            line.endLineNumber,
            line.endColumn
        );
        const id = { major: 1, minor: 1 };
        const text = fn(...args, line);
        if (text) {
            const op = {
                identifier: id,
                range,
                text,
                forceMoveMarkers: true
            };
            this.editor.getEditor().executeEdits("lol", [op]);
        }
    }

    protected makeLink(line) {
        return `[${this.editor
            .getEditor()
            .getModel()
            .getValueInRange(line)}](${this.editor
            .getEditor()
            .getModel()
            .getValueInRange(line)})`;
    }

    protected styleText(prefix: string, suffix: string, line) {
        const prefixLen = prefix.length;
        const suffixLen = suffix.length;
        const val: string = this.editor
            .getEditor()
            .getModel()
            .getValueInRange(line);
        // Cool code that makes it so that if the selected text has identical prefixes/suffixes
        // (i.e bolded already), it removes the selected styling.
        const preSubstr = val.substring(0, prefixLen);
        const sufSubstr = val.substring(val.length - suffixLen, val.length);
        if (preSubstr === prefix && sufSubstr === suffix) {
            return val.substring(prefixLen, val.length - suffixLen);
        } else {
            return `${prefix}${val}${suffix}`;
        }
    }

    protected get getStyle() {
        return this.$store.getters.getTheme === "dark"
            ? { "background-color": "#20212B", "color": "white" }
            : {};
    }

    protected addEmoji(emoji) {
        this.$store.dispatch(
            "editContent",
            this.$store.getters.getContent + emoji.colons
        );
        this.closeAll();
    }

    protected addLink() {
        this.$store.dispatch(
            "editContent",
            this.$store.getters.getContent + `[${this.name}](${this.url})`
        );
        this.closeAll();
    }

    protected addCode(code) {
        let str = "";
        if (this.$store.getters.getContent !== "") {
            str = "\n";
        }
        this.$store.dispatch(
            "editContent",
            `${
                this.$store.getters.getContent
            }${str}\`\`\`${this.language.toLowerCase()}\nCODE HERE\n\`\`\``
        );
        this.closeAll();
    }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="sass">
.picker
    z-index: 1
    position: absolute
.infield
    border-radius: 5px
.popup
    z-index: 1
    position: absolute
    height: auto
    border-radius: 5px
    padding: 10px
.toolbar
    width: 100%
    height: 36px
    border-radius: 10px
    margin-bottom: 10px
    padding: 5px
    overflow-y: auto
.dark
    .popup
        background-color: #20212B
    .toolbar
        background-color: #2a2c39 !important
    .infield
        border-color: #2a2c39 !important
        background-color: #20212B !important
        color: white
.light
    .popup
        background-color: #e9ecef
    .toolbar
        background-color: white !important
.icon
    display: inline-block
    margin-left: 10px
    margin-right: 10px
.icon:hover
    cursor: pointer
</style>
