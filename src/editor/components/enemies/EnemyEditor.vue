<template>
  <div class="layout-h layout-fill" style="min-height: 0">
    <enemy-list class="chrome panel" />
    <div class="chrome panel layout-v layout-fill">
      <div v-if="$state.currentEnemy">
        <div>
          <h2>Name</h2>
          <input type="text" v-model="$state.currentEnemy.name" />
        </div>
        <div>
          <h2>Sprite</h2>
          <div>
            <drop-down v-model="$state.currentEnemy.sprite">
              <div v-for="sprite in $state.sprites" :key="sprite">{{ sprite }}</div>
            </drop-down>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
  import Vue from 'vue'
  import EnemyList from './EnemyList.vue'
  import DropDown from '../controls/DropDown.vue'
  import AnimationPlayer from '../util/AnimationPlayer.vue'
  import DataTable from '../util/DataTable.vue'
  import enemies from '../../../common/data/enemies'

  export default Vue.extend({
    components: {
      EnemyList,
      DropDown,
      AnimationPlayer,
      DataTable,
    },

    data() {
      return {
        enemies,
      }
    },

    created() {
      this.$state.requestData('enemies')
      this.$state.requestData('sprites')
    },
  })
</script>
