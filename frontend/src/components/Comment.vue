<template>
    <div class="comment" :class="getTheme" v-if="alive">
        <div class="metadata">
            <span class="metaelement">
                By:
                <i>
                    <router-link :to="`/profile/${comment.user}`">{{comment.user}}</router-link>
                </i>
            </span>
            <span class="metaelement">
                <font-awesome-icon icon="calendar-alt"></font-awesome-icon>
                <span class="metaelement">
                    {{date}},
                    <i>{{timeSince}}</i>
                </span>
            </span>
            <span class="metaelement" v-if="repliesCount">
                <font-awesome-icon icon="comments"></font-awesome-icon>
                {{repliesCount}}
            </span>
            <span
                v-if="$store.state.username === comment.user || $store.getters.isAdmin || ownsPost"
                style="float: right"
            >
                <a @click="deleteComment" class="delete metaelement">Delete</a>
            </span>
        </div>
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
    @Prop() protected ownsPost: boolean;
    protected alive: boolean;
    protected renderedContent: string;
    protected repliesCount: number | null;
    @Getter("getTheme") private getTheme: string;

    constructor() {
        super();
        this.alive = true;
        this.repliesCount = null;
        this.renderedContent = md.render(this.comment.content);
    }

    get date() {
        return moment
            .utc(this.comment.createdAt)
            .local()
            .format("MM/DD/YYYY, HH:mm");
    }

    get timeSince() {
        return moment(this.comment.createdAt).fromNow();
    }

    protected async deleteComment() {
        try {
            let { data } = await axios.post(
                "http://localhost:3000/deletecomment",
                { id: this.comment.id },
                { withCredentials: true }
            );
            this.$store.dispatch("addAlert", {
                alertType: "success",
                alertText: data.success
            });
            this.$emit("deletedComment");
            this.alive = false;
        } catch (err) {
            if (err.response) {
                this.$store.dispatch("addAlert", {
                    alertType: "danger",
                    alertText: err.response.data.error
                });
            } else {
                this.$store.dispatch("addAlert", {
                    alertType: "danger",
                    alertText: "Something went wrong."
                });
            }
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
.metadata
    border-radius: 20px
    padding: 10px
    margin-bottom: 10px
.metaelement
    margin-left: 10px
    margin-right: 10px
.comment
    padding: 20px
    margin: 20px
    border-radius: 20px
    max-height: 300px
    overflow-y: auto
.comment::-webkit-scrollbar
    width: 10px
.comment::-webkit-scrollbar-thumb
    border-radius: 10px
    -webkit-box-shadow: inset 0 0 6px rgba(0,0,0,.3)
.comment::-webkit-scrollbar-track
    -webkit-box-shadow: inset 0 0 6px rgba(0,0,0,0.3)
.dark
    background-color: #2a2c39 !important
    color: white
    .comment::-webkit-scrollbar-thumb
        background-color: #3e404c
    .delete
        background-color: #2a2c39 !important
    .metadata
        background-color: #20212B !important
.light
    background-color: white !important
    color: black
    .comment::-webkit-scrollbar-thumb
        background-color: #dddddd
    .delete
        background-color: #ffffff !important
    .metadata
        background-color: #e9ecef !important
</style>
