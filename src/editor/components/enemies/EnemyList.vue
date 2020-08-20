<template>
  <div class="enemyList layout-v">
    <action-bar :items="enemyActions" />
    <div class="layout-fill chrome secondary">
      <div
        class="enemy"
        v-for="enemy in $state.enemies"
        :key="enemy"
        @click="() => $state.loadEnemy(enemy)"
      >{{ enemy }}</div>
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
        enemyActions: [
          {
            icon: 'plus',
          },
          {
            icon: 'pencil-alt',
          },
          {
            icon: 'save',
            action: () => {
              this.$state.saveEnemy()
            },
          },
          {
            icon: 'trash',
          },
        ],
      }
    },

    async created() {
      this.$state.requestData('enemies')
    },
  })
</script>

<style scoped>
  .enemyList {
    flex: 0 0 140px;
  }

  .enemy {
    position: relative;
    padding: 0.5rem;
    cursor: default;
  }

  .enemy:hover:before {
    content: '';
    display: block;
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(255, 255, 255, 0.1);
  }

  .enemy.selected {
    background: rgba(0, 0, 0, 0.5);
  }
</style>