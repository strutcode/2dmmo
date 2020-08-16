<template>
  <div class="menubar layout-h">
    <div class="layout-fill">
      <button @click="newMap">New Map</button>
    </div>
    <div class="statusIndicator down" />
  </div>
</template>

<script lang="ts">
  import Vue from 'vue'

  export default Vue.extend({
    methods: {
      newMap() {
        this.$state.createMap()
      },
    },
  })
</script>
<style scoped>
  .menubar {
    padding: 0.5rem 1rem;
  }

  .statusIndicator {
    width: 1rem;
    height: 1rem;
    border-radius: 50%;
    border: 2px solid rgba(0, 0, 0, 0.5);
  }

  .statusIndicator.down {
    background: red;
  }
</style>