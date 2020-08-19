<template>
  <div class="dataTable">
    <table>
      <tr>
        <th v-for="col in columns" :key="col" @click="setSort(col)">
          <slot :name="`col-${col}`">{{ col }}</slot>
          <i class="fa fa-sort-alpha-down" v-if="sort.column === col && sort.asc"></i>
          <i class="fa fa-sort-alpha-down-alt" v-if="sort.column === col && !sort.asc"></i>
        </th>
      </tr>
      <tr v-for="row in computedRows">
        <td v-for="col in columns" :key="col">
          <slot :name="`row-${col}`" :row="row">{{ row[col] }}</slot>
        </td>
      </tr>
    </table>
  </div>
</template>

<script lang="ts">
  import Vue from 'vue'

  export default Vue.extend({
    props: {
      rows: {
        type: Array as () => Record<string, any>[],
        required: true,
      },
      columnFilter: (Function as unknown) as () => (
        value: string,
        index: number,
        array: string[],
      ) => string | undefined,
    },

    data() {
      return {
        indexes: {} as Record<string, Record<string, any>>,
        sort: {
          column: null as string | null,
          asc: true,
        },
      }
    },

    created() {
      this.createIndexes()
    },

    computed: {
      columns(): string[] {
        const columns = Object.keys(this.indexes)

        if (this.columnFilter) {
          return columns.filter(this.columnFilter).filter((v) => v)
        } else {
          return columns
        }
      },
      computedRows(): object[] {
        const col = this.sort.column
        const left = this.sort.asc ? -1 : 1
        const right = -left

        if (col == null) {
          return this.rows
        }

        return [...this.rows].sort((a, b) => {
          if (a[col] < b[col]) return left
          if (a[col] > b[col]) return right
          return 0
        })
      },
    },

    methods: {
      createIndexes() {
        this.indexes = {}

        this.rows.forEach((item, index) => {
          if (item == null || typeof item !== 'object') return

          Object.entries(item).forEach((entry) => {
            const [key, val] = entry
            if (this.indexes[key] == null) {
              this.$set(this.indexes, key, {})
            }

            if (this.indexes[key][val] == null) {
              this.$set(this.indexes[key], String(val), [])
            }

            this.indexes[key][val].push(index)
          })
        })
      },
      setSort(name: string) {
        if (this.sort.column !== name) {
          this.sort.column = name
          this.sort.asc = true
        } else if (this.sort.column === name && this.sort.asc === false) {
          this.sort.column = null
        } else {
          this.sort.asc = false
        }
      },
    },

    watch: {
      rows() {
        this.createIndexes()
      },
    },
  })
</script>

<style scoped>
  table {
    border-spacing: 0;
  }

  th,
  td {
    padding: 0.75em 1.5em;
  }
  tr:nth-child(even) {
    background: rgba(0, 0, 0, 0.2);
  }

  tr:hover {
    background: rgba(255, 255, 255, 0.1);
  }
</style>