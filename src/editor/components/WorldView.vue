<template>
  <canvas class="layout-fill" @pointerdown="click" @wheel="scroll"></canvas>
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
      this.view = new WorldViewRenderer(
        this.$el as HTMLCanvasElement,
        this.$state,
      )

      if (module.hot) {
        module.hot.accept('../graphics/WorldViewRenderer', () => {
          this.view.destroy()
          this.view = new WorldViewRenderer(
            this.$el as HTMLCanvasElement,
            this.$state,
          )
        })
      }
    },

    beforeDestroy() {
      this.view.destroy()
    },

    methods: {
      click(ev: PointerEvent) {
        const move = (ev: PointerEvent) => {
          this.view.panBy(ev.movementX, ev.movementY)
        }

        const stop = (ev: PointerEvent) => {
          window.removeEventListener('pointermove', move)
          window.removeEventListener('pointerup', stop)
        }

        window.addEventListener('pointermove', move)
        window.addEventListener('pointerup', stop)
      },
      scroll(ev: WheelEvent) {
        if (ev.deltaY < 0) {
          this.view.zoomIn()
        } else {
          this.view.zoomOut()
        }
      },
    },
  })
</script>