<template>
  <canvas @contextmenu.prevent @pointerdown="click" @wheel="scroll"></canvas>
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
        const button = ev.button
        let distance = 0

        const setTile = (ev: PointerEvent) => {
          if (this.$state.currentMap && this.$state.selectedTile) {
            const [x, y] = this.view.pointToWorld(ev.offsetX, ev.offsetY)

            this.$state.currentMap.setTile(x, y, this.$state.selectedTile)
          }
        }

        setTile(ev)

        const move = (ev: PointerEvent) => {
          distance += Math.abs(ev.movementX)
          distance += Math.abs(ev.movementY)

          if (button === 0) {
            setTile(ev)
          }
          if (button === 1) {
            this.view.panBy(ev.movementX, ev.movementY)
          }
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
        } else if (ev.deltaY > 0) {
          this.view.zoomOut()
        }
      },
    },
  })
</script>

<style scoped>
  canvas {
    image-rendering: -webkit-optimize-contrast;
    image-rendering: -moz-crisp-edges;
    image-rendering: pixelated;
  }
</style>