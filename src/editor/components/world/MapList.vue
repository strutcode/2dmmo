<template>
  <div class="mapList layout-v">
    <action-bar :items="mapActions" />
    <div class="layout-fill chrome secondary">
      <div
        class="map"
        v-for="map in $state.maps"
        :key="map"
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
          },
          {
            icon: 'pencil-alt',
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
    padding: 0.5rem;
    cursor: default;
  }

  .map.selected {
    background: rgba(0, 0, 0, 0.5);
  }
</style>