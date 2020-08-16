<template>
  <div class="menubar layout-h">
    <div class="layout-fill">
      <button @click="newMap">New Map</button>
    </div>
    <div>Not Connected</div>
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
</style>