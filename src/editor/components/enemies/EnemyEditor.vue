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
          <div class="animRow" v-for="anim of $state.currentEnemy.sprite.animations">
            <animation-player
              :spritesheet="enemies[$state.currentEnemy.sprite.set]"
              :animation="anim"
            />
            <span>Name</span>
            <input type="text" size="5" v-model="anim.name" />
            <span>X</span>
            <input type="text" size="2" v-model="anim.x" />
            <span>Y</span>
            <input type="text" size="2" v-model="anim.y" />
            <span>Frames</span>
            <input type="text" size="2" v-model="anim.frames" />
            <span>FPS</span>
            <input type="text" size="2" v-model="anim.fps" />
            <span>Loop</span>
            <input type="checkbox" v-model="anim.loop" />
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
  import enemies from '../../data/enemies'

  export default Vue.extend({
    components: {
      EnemyList,
      DropDown,
      AnimationPlayer,
    },

    data() {
      return {
        enemies,
      }
    },

    created() {
      this.$state.requestData('enemies')
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
