<template>
  <div class="layerList layout-v">
    <div class="layers layout-fill chrome secondary">
      <div v-for="layer in layers" :key="layer.name" class="layer">{{ layer.name }}</div>
    </div>
  </div>
</template>

<script lang="ts">
  import Vue from 'vue'

  export default Vue.extend({
    computed: {
      layers() {
        return this.$state.currentMap?.layers || []
      },
    },
  })
</script>

<style scoped>
  .layerList {
    flex: 0 1 180px;
  }

  .layer {
    padding: 0.5rem;
  }
</style>