<template>
    <div>
        <div class="toolbar">
            <font-awesome-icon class="icon" icon="link" @click="link"></font-awesome-icon>
            <div v-if="linkPopup" class="link-popup">
                <p>Name</p>
                <input type="text" class="infield" v-model="name">
                <p>Link</p>
                <input type="url" class="infield" v-model="url">
                <br>
                <button style="margin-top: 10px" @click="addMd">Add</button>
            </div>
            <font-awesome-icon class="icon" icon="paperclip"></font-awesome-icon>
            <img class="icon emoji" draggable="false" alt="😃" src="https://twemoji.maxcdn.com/v/12.1.2/72x72/1f603.png">
        </div>
    </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";

@Component
export default class PostToolbar extends Vue {
    protected linkPopup = false;
    protected url: string
    protected name: string
    constructor() {
        super();
        this.url = "";
        this.name = "";
    }

    protected link() {
        this.linkPopup = !this.linkPopup;
    }

    protected addMd() {
        this.$store.dispatch("editContent", this.$store.getters.getContent + `[${this.name}](${this.url})`);
        this.linkPopup = false
    }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="sass">
.infield
    border-radius: 5px
.dark
    .link-popup
        z-index: 1
        position: absolute
        height: auto
        border-radius: 5px
        background-color: #20212B
        padding: 10px
    .toolbar
        width: 100%
        height: 36px
        border-radius: 10px
        margin-bottom: 10px
        background-color: #2a2c39 !important
        padding: 5px
    .infield
        border-color: #2a2c39 !important
        background-color: #20212B !important
        color: white
.light
    .link-popup
            z-index: 1
            position: absolute
            height: auto
            border-radius: 5px
            background-color: #e9ecef
            padding: 10px
    .toolbar
        width: 100%
        height: 36px
        border-radius: 10px
        margin-bottom: 10px
        background-color: white !important
        padding: 5px

.icon
    display: inline-block
    margin-left: 10px
    margin-right: 10px
.icon:hover
    cursor: pointer
</style>
