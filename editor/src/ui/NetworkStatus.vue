<template>
  <div
    class="networkStatus"
    :class="networkStatus"
    :title="networkStatus"
  ></div>
</template>

<script lang="ts">
  import Vue from 'vue'
  import client from '../network/Client'

  export default Vue.extend({
    data() {
      return {
        networkStatus: 'disconnected',
      }
    },

    created() {
      client.onStatusChange = (status: string) => {
        this.networkStatus = status
      }
    },
  })
</script>

<style lang="scss" scoped>
  .networkStatus {
    display: inline-block;
    vertical-align: middle;
    width: 0.6rem;
    height: 0.6rem;
    border-radius: 50%;
    background: rgb(236, 56, 43);
    border: 0.15rem solid rgba(0, 0, 0, 0.5);

    &.connecting {
      background: rgb(236, 178, 43);
    }

    &.connected {
      background: rgb(29, 212, 87);
    }
  }
</style>
