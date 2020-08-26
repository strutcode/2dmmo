<template>
  <div class="server">
    <h2>Server</h2>
    <!-- <div>
      <div>
        <b>User</b>
        <button @click="addChar">New Character</button>

        <div v-for="char in user.characters">
          <input type="text" v-model="char.name" />
          <span>--</span>
          <input type="text" v-model.number="char.hp" />
          <span>/</span>
          <input type="text" v-model.number="char.hpMax" />
        </div>
      </div>
    </div>-->
  </div>
</template>

<script lang="ts">
  import Vue from 'vue'
  import User from './User'
  import Character from './Character'
  import NetworkView from '../client/NetworkView'

  export default Vue.extend({
    methods: {
      addChar(user: User) {
        const char = new Character()
        user.characters.push(char)
        user.activeCharacter = char
      },
    },
  })
</script>

<style scoped>
  .server {
    order: 0;
  }
</style>