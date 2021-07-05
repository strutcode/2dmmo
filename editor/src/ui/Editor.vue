<template>
  <div class="container">
    <div class="navigation">
      <div>Quests</div>
      <div>Foobar</div>
    </div>
    <div class="editor">
      <div class="tabs"></div>
      <div class="content"></div>
    </div>
  </div>
</template>

<script lang="ts">
  import Vue from 'vue'

  export default Vue.extend({})
</script>

<style lang="scss" scoped>
  @import 'vars';

  .container {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    display: flex;
    flex-flow: column nowrap;
    font-family: sans-serif;
    color: #fff;

    .navigation {
      display: flex;
      flex-flow: row;
      background: $secondary;

      & > div {
        background: $tertiary;
        padding: 0.75rem 1.5rem;
      }

      & > div + div {
        border-left: 2px solid rgba(0, 0, 0, 0.2);
      }
    }

    .editor {
      background: hsl(200, 10%, 10%);
      flex-grow: 1;
    }
  }
</style>
