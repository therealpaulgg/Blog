<template>
    <div class="comment" :class="getTheme" v-if="alive">
        <p style="display: inline-block">User: {{comment.user}}, {{date}}</p>
        <a
            v-if="$store.state.username === comment.user"
            style="float: right;"
            @click="deleteComment"
            class="delete"
            :class="getTheme"
        >Delete</a>
        <div v-html="renderedContent"></div>
    </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";
import { Getter } from "vuex-class";
import { CommentModel } from "../models/comment";
import moment from "moment";
import { md } from "../mdparser";
import axios from "axios";

@Component
export default class Comment extends Vue {
    @Prop() protected comment: CommentModel;
    @Getter("getTheme") private getTheme: string;
    alive: boolean;
    renderedContent: string;

    constructor() {
        super();
        this.alive = true;
        this.renderedContent = md.render(this.comment.content);
    }

    get date() {
        return moment
            .utc(this.comment.createdAt)
            .local()
            .format("MM/DD/YYYY, HH:mm");
    }

    protected async deleteComment() {
        try {
            await axios.post(
                "http://localhost:3000/deletecomment",
                { id: this.comment.id },
                { withCredentials: true }
            );
            this.$store.dispatch("addAlert", {
                alertType: "success",
                alertText: "Comment deleted."
            });
            this.alive = false;
            
        } catch (err) {
            // do something
        }
    }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="sass">
.delete
    color: #ff7474 !important
    cursor: pointer
    border-radius: 5px
    padding: 10px
    width: auto
    height: auto
.dark
    background-color: #2a2c39 !important
    padding: 20px
    margin: 20px
    border-radius: 20px
    color: white
    max-height: 400px
    overflow-y: auto
    .delete
        background-color: #20212B !important
.light
    background-color: white !important
    padding: 20px
    margin: 20px
    border-radius: 20px
    color: black
    max-height: 400px
    overflow-y: auto
    .delete
        background-color: #e9ecef !important
</style>
