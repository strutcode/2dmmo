<template>
  <div class="server">
    <h2>Server</h2>
    <div v-for="client in $root.clients">
      <div>Client</div>
      <div class="client">
        <button @click="addChar(client)">New Character</button>

        <div v-for="char in client.characters" class="character">
          <span>Name</span>
          <input type="text" v-model="char.name" />
          <div style="display: inline-block; width: 1rem"></div>
          <span>HP</span>
          <input type="text" size="3" v-model.number="char.hp" />
          <span>/</span>
          <input type="text" size="3" v-model.number="char.hpMax" />

          <div class="inventory">
            <div v-for="item in char.inventory.contents">{{ item.name }}</div>
            <form @submit.prevent="addItem(char, $event)">
              <select name="item">
                <option>Sword of Stabbing</option>
                <option>Wedding Ring</option>
                <option>Evil Eye Stalk</option>
                <option>Health Potion</option>
                <option>Horadric Cube</option>
                <option>Royal Jelly</option>
                <option>Bat Wing Crunchies</option>
              </select>
              <button>Add Item</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
  import Vue from 'vue'
  import User from './User'
  import Character from './Character'
  import Item from './Item'

  export default Vue.extend({
    methods: {
      addChar(user: User) {
        const char = new Character()
        user.characters.push(char)
        user.activeCharacter = char
      },
      addItem(char: Character, event) {
        const form = new FormData(event.target)
        const name = form.get('item')

        if (typeof name === 'string') {
          char.inventory.contents.push(new Item(name))
        }
      },
    },
  })
</script>

<style scoped>
  .server {
    order: 0;
  }

  .client,
  .character,
  .inventory {
    border: 1px solid black;
    padding: 1rem;
  }
</style>