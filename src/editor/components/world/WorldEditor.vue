<template>
  <div class="layout-h layout-fill" style="min-height: 0">
    <map-list class="chrome panel" />
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
  import MapList from './MapList.vue'
  import TileList from './TileList.vue'
  import WorldView from './WorldView.vue'
  import LayerList from './LayerList.vue'

  export default Vue.extend({
    components: {
      MapList,
      TileList,
      WorldView,
      LayerList,
      ToolBar,
    },

    created() {
      this.$state.createMap()
    },
  })
</script>
