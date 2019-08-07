<template>
    <div class="profile">
        <p>Not implemented yet.</p>
        <!-- 
            image of user's gravatar, which the url for is pulled from server. 
            url in format of https://www.gravatar.com/avatar/205e460b479e2e5b48aec07710c08d50?s=200
            generate url ONCE on server using https://www.npmjs.com/package/md5
            -->
        <!-- username of user -->
        <!-- registration date of user, momentjs to display age of account -->
        <!-- number of user comments -->
        <!-- if the user can post, return number of user posts -->
        <!-- have an icon for administrator, moderator, author, or regular user -->
        <!-- 
            if the authenticated user is an admin/mod, 
        provide admin options to delete account w/o banning, 
        shadow ban (ip, username, email banned in DB, cannot log in to see alert because account is deleted (or just shadowBan = true)),
        formal ban (ip, username, email banned in DB, can log in to see their account is banned (ban = true)) 
        show if user has been verified w/ email
        -->
        <!-- add option to report users (hide this if admin) -->
    </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import axios from "axios";
import { State } from "vuex-class";

@Component
export default class Profile extends Vue {

    get theme() {
        return this.$store.getters.getTheme;
    }
}
</script>

<style lang="sass" scoped>
</style>
