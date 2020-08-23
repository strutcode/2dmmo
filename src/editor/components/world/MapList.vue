<template>
  <div class="mapList layout-v">
    <action-bar :items="mapActions" />
    <div class="layout-fill chrome secondary">
      <div
        v-for="map in $state.maps"
        :key="map"
        class="map"
        :class="{ selected: $state.currentMap && $state.currentMap.name === map }"
        @click="() => $state.loadMap(map)"
      >{{ map }}</div>
    </div>
  </div>
</template>

<script lang="ts">
  import Vue from 'vue'
  import ActionBar from '../controls/ActionBar.vue'

  export default Vue.extend({
    components: {
      ActionBar,
    },

    data() {
      return {
        mapActions: [
          {
            icon: 'plus',
            action: () => {
              this.$state.createMap()
            },
          },
          {
            icon: 'pencil-alt',
            action: () => {
              this.$state.renameMap()
            },
          },
          {
            icon: 'save',
            action: () => {
              this.$state.saveMap()
            },
          },
          {
            icon: 'trash',
          },
        ],
      }
    },

    async created() {
      this.$state.requestData('maps')
    },
  })
</script>

<style scoped>
  .mapList {
    flex: 0 0 140px;
  }

  .map {
    position: relative;
    padding: 0.5rem;
    cursor: default;
  }

  .map:hover:before {
    content: '';
    display: block;
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(255, 255, 255, 0.1);
  }

  .map.selected {
    background: rgba(0, 0, 0, 0.5);
  }
</style>