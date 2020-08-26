<template>
  <div class="client">
    <h2>Client</h2>
    <pre>{{ entities }}</pre>
  </div>
</template>

<script lang="ts">
  import Vue from 'vue'
  import NetworkView from './NetworkView'

  export default Vue.extend({
    data() {
      return {
        entities: {} as Record<string, any>,
      }
    },

    created() {
      const view = new NetworkView()
      view.onAdd = (type, id, props) => {
        if (!this.entities[type]) {
          this.$set(this.entities, type, [])
        }

        this.entities[type].push(props)
      }
    },
  })
</script>

<style scoped>
  .client {
    order: 1;
  }
</style>