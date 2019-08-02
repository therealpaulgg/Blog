<template>
  <div class="postblock" :class="getTheme">
    <h1>{{title}}</h1>
    <router-link :to="`/posts/${urlTitle}`">Go to Post!</router-link>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";
import { Getter } from "vuex-class";

@Component
export default class PostBlock extends Vue {
    @Prop(String) protected readonly title!: string;
    @Prop(String) protected readonly content!: string;
    @Prop(String) protected readonly urlTitle!: string;
    @Getter("getTheme") private getTheme: string;
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
.light
    background-color: white !important
    padding: 20px
    margin: 20px
    border-radius: 20px
    color: black
</style>
