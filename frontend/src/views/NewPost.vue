<template>
  <div class="newpost">
    <label>Post Title</label>
    <br />
    <input type="text" v-model="title" />
    <br />
    <label>Content</label>
    <br />
    <div class="row">
      <div class="col">
        <MonacoEditor
          class="editor"
          language="markdown"
          v-model="content"
          width="1200"
          height="1000"
          :theme="theme"
        />
      </div>
      <div class="col">
        <div id="preview" v-html="renderedContent"></div>
      </div>
    </div>

    <br />
    <!-- <button @click="logText">Log text</button> -->

    <button @click="post">Post</button>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Watch } from "vue-property-decorator";
import axios from "axios";
import { Post } from "../models/post";
import { md } from "../mdparser";
import MonacoEditor from "vue-monaco";

@Component({
  components: {
    MonacoEditor
  }
})
export default class NewPost extends Vue {
  @Watch("content")
  test(val: string, oldVal: string) {
    try {
      let foo = md.render(val);
      this.renderedContent = foo;
    } catch (err) {
      console.error(err);
    }
  }

  get theme() {
    let theme = this.$store.getters.getTheme 
    return theme == "dark" ? "vs-dark" : "vs-light" 
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
    axios.post(
      "http://localhost:3000/newpost",
      { title: this.title, content: this.content },
      { withCredentials: true }
    );
  }
}
</script>

<style scoped lang="sass">
.editor
  height: 500px
</style>

