<template>
  <div class="toolbar layout-h">
    <button :class="{ selected: currentTool === 'pencil' }" @click="setTool('pencil')">
      <i class="fa fa-edit"></i>
    </button>
    <button :class="{ selected: currentTool === 'fill' }" @click="setTool('fill')">
      <i class="fa fa-fill-drip"></i>
    </button>
    <button :class="{ selected: currentTool === 'select' }" @click="setTool('select')">
      <i class="fa fa-vector-square"></i>
    </button>
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
    padding: 0.5rem;
  }

  .toolbar button {
    width: 32px;
    height: 32px;
    margin-right: 0.25rem;
  }
</style>