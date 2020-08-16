<template>
  <div class="layout layout-v">
    <menu-bar class="chrome accent" />
    <div class="layout-h layout-fill" style="min-height: 0">
      <tile-list class="chrome panel" />
      <div class="layout-v layout-fill">
        <tool-bar class="chrome panel" />
        <world-view class="layout-fill" />
      </div>
      <layer-list class="chrome panel" />
    </div>
    <status-bar class="chrome secondary" />
  </div>
</template>

<script lang="ts">
  import Vue from 'vue'
  import ToolBar from './ToolBar.vue'
  import MenuBar from './MenuBar.vue'
  import WorldView from './WorldView.vue'
  import TileList from './TileList.vue'
  import LayerList from './LayerList.vue'
  import StatusBar from './StatusBar.vue'

  export default Vue.extend({
    components: {
      MenuBar,
      ToolBar,
      WorldView,
      TileList,
      LayerList,
      StatusBar,
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
