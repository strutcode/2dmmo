<template>
  <div class="menubar layout-h">
    <div
      class="tab"
      :class="{ chrome: $state.mode === 'world' }"
      @click="$state.mode = 'world'"
    >
      World
    </div>
    <div
      class="tab"
      :class="{ chrome: $state.mode === 'enemies' }"
      @click="$state.mode = 'enemies'"
    >
      Enemies
    </div>
    <div
      class="tab"
      :class="{ chrome: $state.mode === 'items' }"
      @click="$state.mode = 'items'"
    >
      Items
    </div>
    <div
      class="tab"
      :class="{ chrome: $state.mode === 'users' }"
      @click="$state.mode = 'users'"
    >
      Users
    </div>
    <div
      class="tab"
      :class="{ chrome: $state.mode === 'config' }"
      @click="$state.mode = 'config'"
    >
      Config
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import WorldView from './WorldView.vue'
import TileList from './TileList.vue'
import LayerList from './LayerList.vue'

export default Vue.extend({
  methods: {
    newMap() {
      this.$state.createMap()
    },
  },
})
</script>
<style scoped>
.tab {
  position: relative;
  font-size: 120%;
  padding: 0 1rem;
  line-height: 3rem;
  cursor: pointer;
}

.tab:hover:before {
  content: '';
  display: block;
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(255, 255, 255, 0.1);
}
</style>
