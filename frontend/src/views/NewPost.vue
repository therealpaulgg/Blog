<template>
  <div class="newpost">
    <label>Post Title</label>
    <br />
    <input type="text" v-model="title" />
    <br />
    <label>Content</label>
    <br />
    <textarea v-model="content" rows="5" cols="80"></textarea>
    <br />
    <!-- <button @click="logText">Log text</button> -->
    <div id="preview" v-html="renderedContent"></div>
    <button @click="post">Post</button>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Watch } from "vue-property-decorator";
import axios from "axios";
import { Post } from "../models/post";
import { md } from "../mdparser"

@Component
export default class Home extends Vue {
  @Watch("content")
  test(val: string, oldVal: string) {
    try {
      let foo = md.render(val);
      this.renderedContent = foo;
    } catch (err) {
      console.error(err);
    }
  }

  title: string;
  content: string;
  renderedContent: string;

  constructor() {
    super();
    this.title = "";
    this.content = "";
    this.renderedContent = "";
  }

  post() {
    axios.post("http://localhost:3000/newpost", {title: this.title, content: this.content})
  }
}
</script>

<style scoped lang="sass">
//@import url("https://cdn.jsdelivr.net/gh/dracula/prism/css/dracula-prism.css")
</style>

