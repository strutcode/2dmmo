<template>
  <div class="layout-h layout-fill" style="min-height: 0">
    <tile-list class="chrome panel" />
    <div class="layout-v layout-fill">
      <tool-bar class="chrome panel" />
      <world-view class="layout-fill" />
    </div>
    <layer-list class="chrome panel" />
  </div>
</template>

<script lang="ts">
  import Vue from 'vue'
  import ToolBar from './ToolBar.vue'
  import WorldView from './WorldView.vue'
  import TileList from './TileList.vue'
  import LayerList from './LayerList.vue'

  export default Vue.extend({
    components: {
      WorldView,
      TileList,
      LayerList,
      ToolBar,
    },
  })
</script>