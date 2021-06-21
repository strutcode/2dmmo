<template>
  <div>
    <form method="GET" action="/game">
      <div>
        <label for="name">Display Name</label>
      </div>
      <div>
        <input type="text" name="name" value="Soandso" />
      </div>
      <div>
        <button type="submit">Launch Game</button>
      </div>
    </form>
  </div>
</template>

<script lang="ts">
  import Vue from 'vue'
  export default Vue.extend({})
</script>
