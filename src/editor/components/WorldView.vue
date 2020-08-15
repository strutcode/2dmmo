<template>
  <canvas class="layout-fill"></canvas>
</template>

<script lang="ts">
  import Vue from 'vue'
  import WorldViewRenderer from '../graphics/WorldViewRenderer'

  export default Vue.extend({
    data() {
      return {
        view: (undefined as unknown) as WorldViewRenderer,
      }
    },

    mounted() {
      this.view = new WorldViewRenderer(this.$el as HTMLCanvasElement)
    },

    beforeDestroy() {
      this.view.destroy()
    },
  })
</script>