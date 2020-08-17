<template>
  <div>
    <div v-for="user in $state.users" :key="user._id">
      <span>{{ user._id }}</span>
      <span>{{ user.username }}</span>
      <i class="fa fa-magic" v-if="user.wizard"></i>
    </div>
  </div>
</template>

<script lang="ts">
  import Vue from 'vue'

  export default Vue.extend({
    created() {
      this.$state.requestData('users')
    },
  })
</script>