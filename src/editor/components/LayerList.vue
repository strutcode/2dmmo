<template>
  <div class="layerList layout-v">
    <div>
      <button @click="() => $state.addLayer()">
        <i class="fa fa-plus"></i>
      </button>
    </div>
    <div class="layers layout-fill chrome secondary">
      <div
        v-for="(layer, l) in layers"
        :key="l"
        class="layer"
        :class="{ chrome: l === $state.activeLayer, accent: l === $state.activeLayer }"
        @click="() => $state.selectLayer(l)"
      >{{ layer.name }}</div>
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