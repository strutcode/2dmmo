<template>
  <div class="statusBar layout-h">
    <div class="statusIndicator down" />
    <div class="layout-fill">Disconnected from server</div>
  </div>
</template>

<script lang="ts">
  import Vue from 'vue'

  export default Vue.extend({})
</script>

<style scoped>
  .statusBar {
    align-items: center;
    padding: 0.5rem 1rem;
    line-height: 1rem;
  }

  .statusIndicator {
    width: 1rem;
    height: 1rem;
    border-radius: 50%;
    border: 2px solid rgba(0, 0, 0, 0.5);
    margin-right: 1rem;
  }

  .statusIndicator.down {
    background: red;
  }
</style>