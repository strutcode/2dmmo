<template>
  <div class="player" :style="calculatedStyle">
    <img ref="img" :src="spritesheet" />
  </div>
</template>

<script lang="ts">
  import Vue from 'vue'
  export default Vue.extend({
    props: {
      spritesheet: {
        type: String,
        required: true,
      },
      animation: {
        type: Object,
        required: true,
      },
      scale: {
        type: Number,
        default: 2,
      },
    },

    data() {
      return {
        frames: 0,
        timer: null as any,
      }
    },

    created() {
      this.timer = setInterval(() => {
        this.frames++
      }, 1000 / this.animation.fps)
    },

    beforeDestroy() {
      if (this.timer) clearTimeout(this.timer)
    },

    computed: {
      calculatedStyle(): object {
        let sheetWidth = 'auto'

        if (this.$refs.img instanceof HTMLImageElement) {
          sheetWidth = `${this.$refs.img.naturalWidth * this.scale}px`
        }

        const left = this.animation.x + (this.frames % this.animation.frames)
        const top = this.animation.y
        const size = 16 * this.scale

        return {
          width: `${size}px`,
          height: `${size}px`,
          backgroundImage: `url(${this.spritesheet})`,
          backgroundSize: `${sheetWidth} auto`,
          backgroundPosition: `${-left * size}px ${-top * size}px`,
        }
      },
    },

    watch: {
      'animation.fps'() {
        if (this.timer) clearTimeout(this.timer)
        this.timer = setInterval(() => {
          this.frames++
        }, 1000 / this.animation.fps)
      },
    },
  })
</script>

<style scoped>
  .player {
    display: inline-block;
    image-rendering: -webkit-optimize-contrast;
    image-rendering: -moz-crisp-edges;
    image-rendering: pixelated;
  }

  img {
    display: none;
  }
</style>