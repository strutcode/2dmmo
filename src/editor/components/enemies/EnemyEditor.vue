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
            <span>Set</span>
            <drop-down v-model="$state.currentEnemy.sprite.set">
              <div v-for="(filename, set) in enemies" :key="set">{{ set }}</div>
            </drop-down>
          </div>

          <h2>Animations</h2>
          <button @click="newAnim">
            <i class="fa fa-plus"></i>
          </button>
          <data-table
            :columns="['preview', 'name', 'x', 'y', 'frames', 'fps', 'loop']"
            :rows="computedAnimations"
          >
            <template v-slot:row-preview="{ row }">
              <animation-player :spritesheet="row.preview" :animation="row.anim" :scale="3" />
            </template>
            <template v-slot:row-name="{ row }">
              <input type="text" size="5" v-model="row.anim.name" />
            </template>
            <template v-slot:row-x="{ row }">
              <input type="text" size="2" v-model="row.anim.x" />
            </template>
            <template v-slot:row-y="{ row }">
              <input type="text" size="2" v-model="row.anim.y" />
            </template>
            <template v-slot:row-frames="{ row }">
              <input type="text" size="2" v-model="row.anim.frames" />
            </template>
            <template v-slot:row-fps="{ row }">
              <input type="text" size="2" v-model="row.anim.fps" />
            </template>
            <template v-slot:row-loop="{ row }">
              <input type="checkbox" v-model="row.anim.loop" />
            </template>
          </data-table>
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
  import enemies from '../../data/enemies'

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
    },

    computed: {
      computedAnimations() {
        const enemy = this.$state.currentEnemy

        if (!enemy) {
          return []
        }

        return enemy.sprite.animations.map((anim) => {
          return {
            preview: enemies[enemy.sprite.set],
            anim,
          }
        })
      },
    },

    methods: {
      newAnim() {
        if (!this.$state.currentEnemy) return

        this.$state.currentEnemy.sprite.animations.push({
          name: '',
          x: 0,
          y: 0,
          frames: 4,
          fps: 4,
          loop: true,
        })
      },
    },
  })
</script>

<style scoped>
  .animRow {
    display: flex;
    align-items: center;
  }

  .animRow > *:not(:first-child) {
    margin-left: 1em;
  }
</style>
