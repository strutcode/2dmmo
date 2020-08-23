<template>
  <div>
    <div>Default map</div>
    <drop-down v-model="$state.config.defaultMap">
      <div v-for="map in $state.maps" :key="map">{{ map }}</div>
    </drop-down>

    <div>
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
      this.$state.loadConfig()
    },
  })
</script>
