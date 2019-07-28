<template>
  <div id="app">
    <div class="container">
      <div id="nav">
        <router-link to="/">Home</router-link> |
        <router-link to="/newpost">Add Post</router-link>
      </div>
      <router-view />
    </div>
  </div>
</template>

<style lang="sass">
@import url("https://cdn.jsdelivr.net/npm/katex@0.10.2/dist/katex.min.css")
</style>
