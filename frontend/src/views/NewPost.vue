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
import markdownit from "markdown-it";
import Prism from "prismjs";
import hljs from "highlight.js";
import emoji from "markdown-it-emoji";
import math from "markdown-it-math";
import katex from "katex";

// Old code that was used for highlightJS

// let md = markdownit({
//   highlight: (str, lang) => {
//     if (lang && hljs.getLanguage(lang)) {
//       try {
//         return (
//           '<pre class="hljs"><code>' +
//           hljs.highlight(lang, str, true).value +
//           "</code></pre>"
//         );
//       } catch (__) {}
//     }
//     return (
//       '<pre class="hljs"><code>' + md.utils.escapeHtml(str) + "</code></pre>"
//     );
//   }
// });

let md: markdownit = markdownit({
  highlight: (str, lang) => {
   if (lang) {
        let langObject = Prism.languages[lang]
      try {
        return (
            `<pre class="language-${lang}"><code>` + 
            Prism.highlight(str, langObject, lang) + 
            '</code></pre>'
        ) 
      } catch (__) {}
    }
    return `<pre class="language-${lang}><code>` + md.utils.escapeHtml(str) + "</code></pre>"
  }
});
md.use(math, {
  inlineOpen: "$",
  inlineClose: "$",
  blockOpen: "$$",
  blockClose: "$$",
  inlineRenderer: (str: string) => {
    let output = "";
    try {
      output = katex.renderToString(str.trim());
    } catch (err) {
      output = err.message;
    }
    return output;
  },
  blockRenderer: (str: string) => {
    let output = "";
    try {
      output = katex.renderToString(str.trim(), { displayMode: true });
    } catch (err) {
      output = err.message;
    }
    return output;
  }
});
md.use(emoji);

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

<style lang="sass">
@import url("https://raw.githubusercontent.com/dracula/prism/master/css/dracula-prism.css")
</style>

