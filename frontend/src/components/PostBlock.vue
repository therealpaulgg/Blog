<template>
    <div class="postblock" :class="getTheme">
        <h1 style="display: inline-block;">{{title}}</h1>
        <p style="float: right;">{{date}}</p>
        <div>
            <router-link :to="`/posts/${urlTitle}`">Go to Post!</router-link>
        </div>
    </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";
import { Getter } from "vuex-class";
import moment from "moment";

@Component
export default class PostBlock extends Vue {
    @Prop(String) protected readonly title!: string;
    @Prop(String) protected readonly content!: string;
    @Prop(String) protected readonly urlTitle!: string;
    @Prop(String) protected readonly createdAt: string;
    @Prop(String) protected readonly updatedAt: string;
    @Getter("getTheme") private getTheme: string;

    get date() {
        return moment
            .utc(this.createdAt)
            .local()
            .format("MM/DD/YYYY, HH:mm");
    }
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
