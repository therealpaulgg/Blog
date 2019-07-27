<template>
  <div class="postblock">
    <h1>My Post Title</h1>
    <router-link to="/posts/test">Go here!</router-link>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';

@Component
export default class PostBlock extends Vue {
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="sass">

</style>
