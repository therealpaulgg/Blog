<template>
    <div class="postblock" :class="getTheme" @click="goToPost">
        <p style="float: right;">{{date}}</p>
        <h1>{{title}}</h1>
    </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";
import { Getter } from "vuex-class";
import moment from "moment";

@Component
export default class PostBlock extends Vue {
    @Prop(Number) protected readonly id!: number;
    @Prop(String) protected readonly title!: string;
    @Prop(String) protected readonly content!: string;
    @Prop(String) protected readonly urlTitle!: string;
    @Prop(String) protected readonly createdAt: string;
    @Prop(String) protected readonly updatedAt: string;
    @Getter("getTheme") private getTheme: string;

    get date() {
        return `${moment
            .utc(this.createdAt)
            .local()
            .format("MM/DD/YYYY, HH:mm")}, ${moment(this.createdAt).fromNow()}`;
    }

    protected goToPost() {
        this.$router.push(`/posts/${this.id}/${this.urlTitle}`)
    }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="sass">
.postblock
    padding: 20px
    margin: 20px
    border-radius: 20px
    transition: 0.5s
    -webkit-transition: 0.5s
.postblock.dark
    color: white
    background-color: #2a2c39 !important
.postblock.dark:hover
    background-color: #3e4154 !important
.postblock.light    
    background-color: white !important
    color: black
.postblock.light:hover
    background-color: #f2feff !important
.postblock:hover
    border-radius: 50px
    transition: 0.5s
    -webkit-transition: 0.5s
    cursor: pointer
</style>
