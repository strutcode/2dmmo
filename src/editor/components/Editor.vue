<template>
  <div class="layout layout-v">
    <main-bar class="chrome accent" />
    <world-editor v-if="$state.mode === 'world'" />
    <div class="chrome layout-fill" v-else-if="$state.mode === 'enemies'" />
    <div class="chrome layout-fill" v-else-if="$state.mode === 'items'" />
    <user-editor class="chrome layout-fill" v-else-if="$state.mode === 'users'" />
    <status-bar class="chrome secondary" />
  </div>
</template>

<script lang="ts">
  import Vue from 'vue'
  import MainBar from './MainBar.vue'
  import StatusBar from './StatusBar.vue'
  import WorldEditor from './world/WorldEditor.vue'
  import UserEditor from './users/UserEditor.vue'

  export default Vue.extend({
    components: {
      MainBar,
      StatusBar,
      WorldEditor,
      UserEditor,
    },
  })
</script>

<style scoped>
  .layout {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
  }
</style>
