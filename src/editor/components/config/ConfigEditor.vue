<template>
  <div>
    <div>Default map</div>
    <drop-down>
      <div>Test</div>
    </drop-down>
  </div>
</template>

<script lang="ts">
  import Vue from 'vue'
  import DropDown from '../controls/DropDown.vue'

  export default Vue.extend({
    components: {
      DropDown,
    },
  })
</script>