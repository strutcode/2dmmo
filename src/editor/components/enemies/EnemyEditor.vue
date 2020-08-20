<template>
  <div class="layout-h layout-fill" style="min-height: 0">
    <enemy-list class="chrome panel" />
    <div class="chrome panel layout-v layout-fill">Details panel</div>
  </div>
</template>

<script lang="ts">
  import Vue from 'vue'
  import EnemyList from './EnemyList.vue'

  export default Vue.extend({
    components: {
      EnemyList,
    },

    created() {
      this.$state.requestData('enemies')
    },
  })
</script>
