<template>
  <div class="comment" :class="getTheme">
      <p>User: {{comment.user}}, {{date}}</p>
      <div v-html="comment.content"></div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";
import { Getter } from "vuex-class";
import { CommentModel } from "../models/comment";
import moment from "moment";

@Component
export default class Comment extends Vue {
    @Prop() protected comment: CommentModel;
    @Getter("getTheme") private getTheme: string;

    get date() {
        return moment.utc(this.comment.createdAt).local().format("MM/DD/YYYY, HH:mm");
    }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="sass">
.dark
    background-color: #2a2c39 !important
    padding: 20px
    margin: 20px
    border-radius: 20px
    color: white
    max-height: 400px
    overflow-y: auto
.light
    background-color: white !important
    padding: 20px
    margin: 20px
    border-radius: 20px
    color: black
    max-height: 400px
    overflow-y: auto
</style>
