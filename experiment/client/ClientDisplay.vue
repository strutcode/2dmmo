<template>
  <div class="client">
    <h2>Client</h2>
    <pre>{{ entities }}</pre>
  </div>
</template>

<script lang="ts">
  import Vue from 'vue'
  import ClientView from '../common/ClientView'

  export default Vue.extend({
    data() {
      return {
        entities: [] as any[],
      }
    },

    created() {
      const view = new ClientView()

      view.onAdd = (object) => {
        this.entities.push(object)
      }

      view.connect()
    },
  })
</script>

<style scoped>
  .client {
    order: 1;
  }
</style>