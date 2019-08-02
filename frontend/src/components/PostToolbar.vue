<template>
    <div class="toolbar">
        <font-awesome-icon class="icon" icon="link" @click="toggle(0)" ref="linkbtn"></font-awesome-icon>
        <div
            v-if="popups[0]"
            v-closable="{
                        exclude: refs,
                        handler: 'closeAll'
                    }"
            class="popup"
        >
            <p>Name</p>
            <input type="text" class="infield" v-model="name" />
            <p>Link</p>
            <input type="url" class="infield" v-model="url" />
            <br />
            <button style="margin-top: 10px" @click="addLink">Add</button>
        </div>
        <!-- <font-awesome-icon class="icon" icon="paperclip" ref="clipbtn"></font-awesome-icon> -->
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
        <div class="popup" v-if="popups[2]"
            v-closable="{
                        exclude: refs,
                        handler: 'closeAll'
                    }">
            <p>Language</p>
            <input type="text" class="infield" v-model="language" />
            <br>
            <button style="margin-top: 10px" @click="addCode">Add</button>
        </div>
        <font-awesome-icon class="icon" icon="file-code" ref="htmlbtn" @click="toggle(3)"></font-awesome-icon>
        <div class="popup" v-if="popups[3]"
            v-closable="{
                        exclude: refs,
                        handler: 'closeAll'
                    }">
            <p>Hey! Markdown is a superset of HTML! Just paste your HTML (and even inline CSS styles) into the editor!</p>
        </div>
        <font-awesome-icon class="icon" icon="heading" ref="headerbtn" @click="toggle(4)"></font-awesome-icon>
        <div class="popup" v-if="popups[4]"
            v-closable="{
                        exclude: refs,
                        handler: 'closeAll'
                    }">
            <p>Type '# My Header' for h1, '## My Header' for h2, up to h6.</p>
        </div>
        <font-awesome-icon class="icon" icon="bold" ref="boldbtn" @click="toggle(5)"></font-awesome-icon>
        <div class="popup" v-if="popups[5]"
            v-closable="{
                        exclude: refs,
                        handler: 'closeAll'
                    }">
            <p>Use one of the following to become <b>bold</b>: **mytext**, __mytext__</p>
        </div>
        <font-awesome-icon class="icon" icon="italic" ref="italicbtn" @click="toggle(6)"></font-awesome-icon>
        <div class="popup" v-if="popups[6]"
            v-closable="{
                        exclude: refs,
                        handler: 'closeAll'
                    }">
            <p>Use *mytext* to become <i>italic</i></p>
        </div>
        <font-awesome-icon class="icon" icon="quote-left" ref="quotebtn" @click="toggle(7)"></font-awesome-icon>
        <div class="popup" v-if="popups[7]"
            v-closable="{
                        exclude: refs,
                        handler: 'closeAll'
                    }">
            <p>Use '> my quote here' to create quoted text.</p>
        </div>
    </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";
import { Picker } from "emoji-mart-vue-fast";
import "../assets/css/emoji-mart.css";

@Component({
    components: {
        Picker
    }
})
export default class PostToolbar extends Vue {
    protected popups: boolean[];
    protected POPUP_NUM = 8
    protected linkPopup = false;
    protected emojiPopup = false;
    protected boldPopup = false;
    protected attachmentPopup = false;
    protected codePopup = false;
    protected htmlPopup = false;
    protected headingPopup = false;
    protected italicPopup = false;
    protected quotePopup = false;
    protected url: string;
    protected name: string;
    protected language: string
    protected refs = ['linkbtn', 'emojibtn', 'codebtn', 'htmlbtn', 'headerbtn', 'boldbtn', 'italicbtn', 'quotebtn']

    constructor() {
        super();
        this.url = "";
        this.name = "";
        this.language = "";
        this.popups = []
        for (let i = 0; i < this.POPUP_NUM; i++) {
            Vue.set(this.popups, i, false);
        }
    }

    protected toggle(index) {
        console.log("me here")
        for (let i = 0; i < this.POPUP_NUM; i++) {
            if (i === index) {
                Vue.set(this.popups, i, !this.popups[i]);
            } else {
                Vue.set(this.popups, i, false);
            }
        }
        console.log(this.popups)
    }

    closeAll() {
        for (let i = 0; i < this.POPUP_NUM; i++) {
            Vue.set(this.popups, i, false);            
        }
    }

    protected get getStyle() {
        return this.$store.getters.getTheme === "dark"
            ? { "background-color": "#20212B", color: "white" }
            : {};
    }

    protected addEmoji(emoji) {
        this.$store.dispatch(
            "editContent",
            this.$store.getters.getContent + emoji.colons
        );
        this.emojiPopup = false;
    }

    protected addLink() {
        this.$store.dispatch(
            "editContent",
            this.$store.getters.getContent + `[${this.name}](${this.url})`
        );
        this.linkPopup = false;
    }

    protected addCode(code) {
        let str = ""
        if (this.$store.getters.getContent != "") {
            str = "\n"
        }
        this.$store.dispatch(
            "editContent",
            `${this.$store.getters.getContent}${str}\`\`\`${this.language.toLowerCase()}\nCODE HERE\n\`\`\``
        );
        this.emojiPopup = false;
    }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="sass">
.picker
    z-index: 
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
