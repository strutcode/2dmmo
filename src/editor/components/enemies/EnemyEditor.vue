<template>
  <div class="layout-h layout-fill" style="min-height: 0">
    <enemy-list class="chrome panel" />
    <div class="chrome panel layout-v layout-fill">
      <div v-if="$state.currentEnemy">
        <div>
          <h3>Name</h3>
          <input name="name" type="text" v-model="$state.currentEnemy.name" />
        </div>
        <div>
          <h3>Sprite</h3>
          <div>
            <span>Set</span>
            <input name="name" type="text" v-model="$state.currentEnemy.sprite.set" />
          </div>
          <span>X</span>
          <input name="name" type="number" v-model="$state.currentEnemy.sprite.x" />
          <span>Y</span>
          <input name="name" type="number" v-model="$state.currentEnemy.sprite.y" />
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
  import Vue from 'vue'
  import EnemyList from './EnemyList.vue'
  import DropDown from '../controls/DropDown.vue'

  export default Vue.extend({
    components: {
      EnemyList,
      DropDown,
    },

    created() {
      this.$state.requestData('enemies')
    },
  })
</script>
