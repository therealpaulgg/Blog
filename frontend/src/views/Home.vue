<template>
  <div class="home">
    <PostBlock
      v-for="post in posts"
      :key="post.id"
      :title="post.title"
      :content="post.content"
      :url_title="post.url_title"
    ></PostBlock>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import PostBlock from "@/components/PostBlock.vue"; // @ is an alias to /src
import axios from "axios";
import { Post } from "../models/post";

@Component({
  components: {
    PostBlock
  }
})
export default class Home extends Vue {
  posts: Array<Post>;

  constructor() {
    super();
    this.posts = [];
  }

  async mounted() {
    let { data } = await axios.get("http://localhost:3000/posts");
    this.posts = data;
  }
}
</script>