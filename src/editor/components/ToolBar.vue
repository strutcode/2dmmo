<template>
  <div class="toolbar layout-h">
    <button :class="{ selected: currentTool === 'pencil' }" @click="setTool('pencil')">P</button>
    <button :class="{ selected: currentTool === 'fill' }" @click="setTool('fill')">F</button>
    <button :class="{ selected: currentTool === 'select' }" @click="setTool('select')">S</button>
  </div>
</template>

<script lang="ts">
  import Vue from 'vue'
  import { ToolType } from '../EditorState'

  export default Vue.extend({
    computed: {
      currentTool() {
        return this.$state.currentTool
      },
    },

    methods: {
      setTool(newTool: ToolType) {
        this.$state.currentTool = newTool
      },
    },
  })
</script>

<style scoped>
  .toolbar {
    padding: 0.25rem;
  }

  .toolbar button {
    width: 32px;
    height: 32px;
    margin-right: 0.25rem;
  }

  .toolbar button.selected {
    background: blue;
  }
</style>