<template>
  <div class="layerList layout-v">
    <div class="tools">
      <button @click="() => $state.layerAdd()">
        <i class="fa fa-plus"></i>
      </button>
      <button @click="() => $state.layerRename()">
        <i class="fa fa-edit"></i>
      </button>
      <button @click="() => $state.layerUp()">
        <i class="fa fa-chevron-up"></i>
      </button>
      <button @click="() => $state.layerDown()">
        <i class="fa fa-chevron-down"></i>
      </button>
      <button @click="() => $state.layerDelete()">
        <i class="fa fa-trash"></i>
      </button>
    </div>
    <div class="layers layout-fill chrome secondary">
      <div
        v-for="(layer, l) in layers"
        :key="l"
        class="layer"
        :class="{ selected: l === $state.activeLayer }"
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

  .tools {
    margin-bottom: 0.5em;
  }

  .tools button {
    width: 32px;
    height: 32px;
  }

  .layer {
    position: relative;
    padding: 0.5rem;
    cursor: default;
  }

  .layer:hover:before {
    content: '';
    display: block;
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(255, 255, 255, 0.1);
  }

  .layer.selected {
    background: rgba(0, 0, 0, 0.5);
  }
</style>