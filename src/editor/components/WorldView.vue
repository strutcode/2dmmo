<template>
  <div class="worldView">
    <canvas ref="canvas" @contextmenu.prevent @pointerdown="click" @wheel="scroll"></canvas>
  </div>
</template>

<script lang="ts">
  import Vue from 'vue'
  import WorldViewRenderer from '../graphics/WorldViewRenderer'

  // For HMR
  import EditorState from '../EditorState'
  EditorState

  export default Vue.extend({
    data() {
      return {
        view: (undefined as unknown) as WorldViewRenderer,
      }
    },

    mounted() {
      this.view = new WorldViewRenderer(
        this.$refs.canvas as HTMLCanvasElement,
        this.$state,
      )

      if (module.hot) {
        module.hot.accept(
          ['../graphics/WorldViewRenderer', '../EditorState'],
          () => {
            this.view.destroy()
            this.view = new WorldViewRenderer(
              this.$refs.canvas as HTMLCanvasElement,
              this.$state,
            )
          },
        )
      }
    },

    beforeDestroy() {
      this.view.destroy()
    },

    methods: {
      click(ev: PointerEvent) {
        const button = ev.button
        const [x, y] = this.view.pointToWorld(ev.offsetX, ev.offsetY)
        const mod = {
          ctrl: ev.ctrlKey,
          alt: ev.altKey,
          shift: ev.shiftKey,
        }

        if (button !== 1) {
          this.$state.onClick(x, y, mod)
        }

        const move = (ev: PointerEvent) => {
          const [x, y] = this.view.pointToWorld(ev.offsetX, ev.offsetY)
          const mod = {
            ctrl: ev.ctrlKey,
            alt: ev.altKey,
            shift: ev.shiftKey,
          }

          if (button === 1) {
            this.view.panBy(ev.movementX, ev.movementY)
          } else {
            this.$state.onDrag(x, y, mod)
          }
        }

        const stop = (ev: PointerEvent) => {
          const [x, y] = this.view.pointToWorld(ev.offsetX, ev.offsetY)
          const mod = {
            ctrl: ev.ctrlKey,
            alt: ev.altKey,
            shift: ev.shiftKey,
          }

          if (button !== 1) {
            this.$state.onDrop(x, y, mod)
          }

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
  .worldView {
    position: relative;
  }

  canvas {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    image-rendering: -webkit-optimize-contrast;
    image-rendering: -moz-crisp-edges;
    image-rendering: pixelated;
  }
</style>