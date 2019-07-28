<template>
  <div class="post">
    <div class="container">
      <h1>{{header}}</h1>
      <!-- <p v-if="title == 'foo'">CYKA BLYAD</p> -->
      <div v-html="content"></div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";
import axios from "axios";

@Component
export default class Post extends Vue {
  @Prop(String) readonly title!: string;

  header: string | null;
  content: string | null;

  constructor() {
    super();
    this.header = null;
    this.content = null;
  }

  async mounted() {
    let { data }: any = await axios.get(`http://localhost:3000/post/${this.title}`);
    this.header = data.title;
    this.content = data.content;
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="sass">
// @import url("https://cdn.jsdelivr.net/gh/dracula/prism/css/dracula-prism.css")
</style>
