<template>
  <div class="tileList layout-v">
    <select v-model="tilesKey">
      <option v-for="(url, key) in tileSets" :key="key">{{ key }}</option>
    </select>
    <div class="tiles">
      <template v-for="(_, y) in tilesH">
        <div
          class="tile"
          :class="{ selected: selected === `${x},${y}`}"
          v-for="(_, x) in tilesW"
          :key="`${x},${y}`"
          :style="{ backgroundPosition: `${-x * 32}px ${-y * 32}px`, backgroundSize: `${tilesW * 16 * 2}px ${tilesH * 16 * 2}px`, backgroundImage: `url(${tileSets[tilesKey]})` }"
          @click="selected = `${x},${y}`"
        ></div>
      </template>
      <!-- <img :src="tileSets[tilesKey]" /> -->
    </div>
  </div>
</template>

<script lang="ts">
  import Vue from 'vue'

  const tilesCtx = require.context(
    '../../../assets/HAS Overworld 2.0/',
    true,
    /LandTileset\.png$/,
  )
  const tileSets = tilesCtx.keys().reduce((acc, key) => {
    const [, name] = key.match(/\.\/(.+?)\/.*/)

    acc[name] = tilesCtx(key).default

    return acc
  }, {} as Record<string, string>)

  export default Vue.extend({
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

    watch: {
      tilesKey() {
        this.img.src = tileSets[this.tilesKey]
      },
    },
  })
</script>

<style scoped>
  .tileList {
    flex: 0 0 146px;
  }

  .tiles {
    display: flex;
    flex-flow: row wrap;
    overflow: scroll;
    line-height: 16px;
  }

  .tile {
    display: inline-block;
    width: 32px;
    height: 32px;
    image-rendering: pixelated;
    image-rendering: crisp-edges;
    image-rendering: optimizespeed;
  }

  .tile.selected {
    border: 2px solid magenta;
    margin: -2px;
  }
</style>