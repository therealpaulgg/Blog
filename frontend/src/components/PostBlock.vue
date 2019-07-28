<template>
  <div class="postblock">
    <h1>{{title}}</h1>
    <router-link :to="`/posts/${url_title}`">Go to Post!</router-link>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';

@Component
export default class PostBlock extends Vue {
    @Prop(String) readonly title!: string
    @Prop(String) readonly content!: string
    @Prop(String) readonly url_title!: string
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="sass">

</style>
