<template>
  <div class="layout layout-v">
    <main-bar class="chrome accent" />
    <world-editor v-if="$state.mode === 'world'" />
    <enemy-editor class="chrome layout-fill" v-else-if="$state.mode === 'enemies'" />
    <div class="chrome layout-fill" v-else-if="$state.mode === 'items'" />
    <user-editor class="chrome panel layout-fill" v-else-if="$state.mode === 'users'" />
    <config-editor class="chrome panel layout-fill" v-else-if="$state.mode === 'config'" />
    <status-bar class="chrome secondary" />
  </div>
</template>

<script lang="ts">
  import Vue from 'vue'
  import MainBar from './MainBar.vue'
  import StatusBar from './StatusBar.vue'
  import WorldEditor from './world/WorldEditor.vue'
  import EnemyEditor from './enemies/EnemyEditor.vue'
  import UserEditor from './users/UserEditor.vue'
  import ConfigEditor from './config/ConfigEditor.vue'

  export default Vue.extend({
    components: {
      MainBar,
      StatusBar,
      WorldEditor,
      EnemyEditor,
      UserEditor,
      ConfigEditor,
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
