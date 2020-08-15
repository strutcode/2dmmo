<template>
  <div class="layout layout-v">
    <menu-bar class="chrome secondary" />
    <div class="layout-h layout-fill">
      <tile-list class="chrome panel" />
      <div class="layout-v layout-fill">
        <tool-bar class="chrome" />
        <world-view class="layout-fill" />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
  import Vue from 'vue'
  import ToolBar from './ToolBar.vue'
  import MenuBar from './MenuBar.vue'
  import WorldView from './WorldView.vue'
  import TileList from './TileList.vue'

  export default Vue.extend({
    components: {
      MenuBar,
      ToolBar,
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
