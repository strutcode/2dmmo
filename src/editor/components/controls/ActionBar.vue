<template>
  <div class="actionBar">
    <button v-for="item in items" :key="item.icon" @click="() => item.action && item.action()">
      <i :class="['fa', `fa-${item.icon}`]"></i>
    </button>
  </div>
</template>

<script lang="ts">
  import Vue from 'vue'

  interface ActionBarItem {
    icon: string
    action?: () => void
  }

  export default Vue.extend({
    props: {
      items: Array as () => ActionBarItem[],
    },
  })
</script>

<style scoped>
  .actionBar {
    margin-bottom: 0.5em;
  }

  .actionBar button {
    width: 32px;
    height: 32px;
  }
</style>