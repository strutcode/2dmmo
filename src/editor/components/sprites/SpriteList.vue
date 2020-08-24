<template>
  <div class="spriteList layout-v">
    <action-bar :items="spriteActions" />
    <div class="layout-fill chrome secondary">
      <div
        v-for="sprite in $state.sprites"
        :key="sprite"
        class="sprite"
        :class="{
          selected: $state.currentSprite && $state.currentSprite.name === sprite,
        }"
        @click="() => $state.loadSprite(sprite)"
      >{{ sprite }}</div>
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
        spriteActions: [
          {
            icon: 'plus',
            action: () => {
              this.$state.createSprite()
            },
          },
          {
            icon: 'pencil-alt',
            action: () => {
              this.$state.renameSprite()
            },
          },
          {
            icon: 'save',
            action: () => {
              this.$state.saveSprite()
            },
          },
          {
            icon: 'trash',
            action: () => {
              this.$state.deleteSprite()
            },
          },
        ],
      }
    },

    async created() {
      this.$state.requestData('sprites')
    },
  })
</script>

<style scoped>
  .spriteList {
    flex: 0 0 200px;
  }

  .sprite {
    position: relative;
    padding: 0 1.2em;
    line-height: 2.5em;
    cursor: default;
  }

  .sprite:hover:before {
    content: '';
    display: block;
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(255, 255, 255, 0.1);
  }

  .sprite.selected {
    background: rgba(0, 0, 0, 0.5);
  }
</style>
