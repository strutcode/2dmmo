<template>
  <div class="layout layout-v">
    <toolbar />
    <world-view />
  </div>
</template>

<script lang="ts">
  import Vue from 'vue'
  import Toolbar from './Toolbar.vue'
  import WorldView from './WorldView.vue'

  export default Vue.extend({
    components: {
      Toolbar,
      WorldView,
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
