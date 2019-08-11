<template>
    <div class="notifications">
        <p>Not implemented yet.</p>
    </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import PostBlock from "@/components/PostBlock.vue"; // @ is an alias to /src
import axios from "axios";
import { State } from "vuex-class";

@Component
export default class Notifications extends Vue {

    get theme() {
        return this.$store.getters.getTheme;
    }
}
</script>

<style lang="sass" scoped>
</style>
