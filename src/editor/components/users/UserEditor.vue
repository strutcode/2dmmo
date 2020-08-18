<template>
  <div>
    <data-table :rows="$state.users" :columnFilter="columnFilter">
      <template v-slot:col-_id>ID</template>
      <template v-slot:col-username>Username</template>
      <template v-slot:col-wizard>Wizard?</template>

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