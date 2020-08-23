<template>
  <div class="tileList layout-v">
    <div class="controls">
      <drop-down v-model="tilesKey" style="width: 100%">
        <div v-for="(url, key) in tileSets" :key="key" :value="key">{{ key }}</div>
      </drop-down>
    </div>
    <div class="tiles layout-v">
      <div class="layout-h" v-for="(_, y) in tilesH" :key="y">
        <div
          class="tile"
          :class="tileClass(x, y)"
          v-for="(_, x) in tilesW"
          :key="x"
          :style="{
            backgroundPosition: `${-x * 32}px ${-y * 32}px`,
            backgroundSize: `${tilesW * 16 * 2}px ${tilesH * 16 * 2}px`,
            backgroundImage: `url(${tileSets[tilesKey]})`,
          }"
          @click="$state.selectTile(tilesKey, x, y)"
        ></div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
  import Vue from 'vue'
  import tileSets from '../../../common/data/tilesets'
  import DropDown from '../controls/DropDown.vue'

  export default Vue.extend({
    components: { DropDown },

    data() {
      return {
        tilesKey: 'GrassBiome',
        tileSets,
        tilesW: 0,
        tilesH: 0,
        selected: '',
        img: document.createElement('img'),
      }
    },

    created() {
      this.img.src = tileSets[this.tilesKey]
      this.img.style.display = 'none'
      this.img.onload = () => {
        this.tilesW = this.img.width / 16
        this.tilesH = this.img.height / 16
      }
      document.body.appendChild(this.img)
    },

    methods: {
      tileClass(x: number, y: number): object {
        if (!this.$state.selectedTile) return {}

        return {
          selected:
            this.$state.selectedTile.x === x &&
            this.$state.selectedTile.y === y &&
            this.$state.selectedTile.set === this.tilesKey,
        }
      },
    },

    watch: {
      tilesKey() {
        this.img.src = tileSets[this.tilesKey]
      },
    },
  })
</script>

<style scoped>
  .tileList {
    flex: 0 0 164px;
  }

  .controls {
    margin-bottom: 0.5rem;
  }

  .tiles {
    overflow: auto;
  }

  .tile {
    flex: 0 0 32px;
    width: 32px;
    height: 32px;
    image-rendering: -webkit-optimize-contrast;
    image-rendering: -moz-crisp-edges;
    image-rendering: pixelated;
    margin: 2px;
  }

  .tile.selected {
    border: 2px solid magenta;
    margin: 0;
  }
</style>
