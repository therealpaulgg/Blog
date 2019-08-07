<template>
    <div class="administration">
        <p>Not implemented yet.</p>
        <!-- I dont really know what to do for this. Maybe show users, posts, etc in paginated format?--> 
    </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import PostBlock from "@/components/PostBlock.vue"; // @ is an alias to /src
import axios from "axios";
import { State } from "vuex-class";

@Component
export default class Administration extends Vue {

    get theme() {
        return this.$store.getters.getTheme;
    }
}
</script>

<style lang="sass" scoped>
</style>
