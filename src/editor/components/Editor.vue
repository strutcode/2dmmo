<template>
  <div class="layout layout-v">
    <toolbar class="chrome" />
    <div class="layout-h layout-fill">
      <tile-list class="chrome panel" />
      <world-view />
    </div>
  </div>
</template>

<script lang="ts">
  import Vue from 'vue'
  import Toolbar from './Toolbar.vue'
  import WorldView from './WorldView.vue'
  import TileList from './TileList.vue'

  export default Vue.extend({
    components: {
      Toolbar,
      WorldView,
      TileList,
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
