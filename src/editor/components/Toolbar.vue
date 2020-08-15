<template>
  <div class="toolbar layout-h">
    <button @click="newMap">New Map</button>
  </div>
</template>

<script lang="ts">
  import Vue from 'vue'
  export default Vue.extend({
    methods: {
      newMap() {
        this.$state.createMap()
      }
    }
  })
</script>