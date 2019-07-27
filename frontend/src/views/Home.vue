<template>
  <div class="home">
    <PostBlock></PostBlock>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import PostBlock from '@/components/PostBlock.vue'; // @ is an alias to /src

@Component({
  components: {
    PostBlock,
  },
})
export default class Home extends Vue {}
</script>
