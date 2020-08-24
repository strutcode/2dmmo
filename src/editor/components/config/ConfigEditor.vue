<template>
  <div>
    <h2>Default Map</h2>
    <drop-down v-model="$state.config.defaultMap">
      <div v-for="map in $state.maps" :key="map">{{ map }}</div>
    </drop-down>

    <h2>Player Sprite</h2>
    <drop-down v-model="$state.config.playerSprite">
      <div v-for="sprite in $state.sprites" :key="sprite">{{ sprite }}</div>
    </drop-down>

    <div style="margin-top: 1em">
      <button class="primary" @click="() => $state.saveConfig()">Save</button>
    </div>
  </div>
</template>

<script lang="ts">
  import Vue from 'vue'
  import DropDown from '../controls/DropDown.vue'

  export default Vue.extend({
    components: {
      DropDown,
    },

    created() {
      this.$state.requestData('maps')
      this.$state.requestData('sprites')
      this.$state.loadConfig()
    },
  })
</script>
