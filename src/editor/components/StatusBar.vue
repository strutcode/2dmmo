<template>
  <div class="statusBar layout-h">
    <div class="statusIndicator" :class="{ up: $state.connected, down: !$state.connected }" />
    <div class="layout-fill">{{ connectionStatus }}</div>
  </div>
</template>

<script lang="ts">
  import Vue from 'vue'

  export default Vue.extend({
    computed: {
      connectionStatus() {
        if (this.$state.connected) {
          return 'Connected to server'
        }

        return 'Disconnected from server'
      },
    },
  })
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

  .statusIndicator.up {
    background: green;
  }
</style>