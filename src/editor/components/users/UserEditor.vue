<template>
  <div>
    <data-table :rows="$state.users" :columnFilter="columnFilter">
      <template v-slot:col-id>ID</template>
      <template v-slot:col-username>Username</template>
      <template v-slot:col-wizard>Wizard?</template>
      <template v-slot:col-online>
        <i class="fa fa-network-wired"></i>
      </template>

      <template v-slot:row-online="{ row }">
        <div class="indicator" :class="{ online: row.online, offline: !row.online }"></div>
      </template>
      <template v-slot:row-username="{ row }">
        <i class="fa fa-hat-wizard" v-if="row.wizard"></i>
        <span>{{ row.username }}</span>
      </template>
    </data-table>
  </div>
</template>

<script lang="ts">
  import Vue from 'vue'
  import DataTable from '../util/DataTable.vue'

  export default Vue.extend({
    components: {
      DataTable,
    },

    created() {
      this.$state.requestData('users')
    },

    methods: {
      columnFilter(name: string) {
        if (name === '_rev') return false
        if (name === 'wizard') return false

        return true
      },
    },
  })
</script>

<style scoped>
  .indicator {
    width: 0.6em;
    height: 0.6em;
    border-radius: 50%;
    border: 2px solid rgba(0, 0, 0, 0.5);
    margin: 0 auto;
  }

  .indicator.online {
    background: green;
  }

  .indicator.offline {
    background: red;
  }
</style>