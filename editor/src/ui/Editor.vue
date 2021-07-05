<template>
  <div class="container">
    <div class="navigation">
      <div>Players</div>
      <div>NPCs</div>
      <div>Quests</div>
      <div>Items</div>
      <div>Maps</div>
    </div>
    <div class="editor">
      <div class="listView"></div>
      <div class="main">
        <div class="tabs">
          <div class="active">Test.quest</div>
          <div>Test2.quest</div>
          <div>Test3.quest</div>
        </div>
        <div class="content">
          <quest-editor></quest-editor>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
  import Vue from 'vue'

  import QuestEditor from './QuestEditor.vue'

  export default Vue.extend({
    components: {
      QuestEditor,
    },
  })
</script>

<style lang="scss" scoped>
  @import '../style/vars';

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
      background: $menu;

      & > div {
        cursor: pointer;
        padding: 0.5rem 1rem;
        // border-right: 2px solid rgba(0, 0, 0, 0.2);

        &:hover {
          background: rgba(0, 0, 0, 0.25);
        }
      }
    }

    .editor {
      flex-grow: 1;
      display: flex;
      flex-flow: row nowrap;

      .listView {
        width: 20%;
        background: $secondary;
      }

      .main {
        display: flex;
        flex-flow: column nowrap;
        flex-grow: 1;

        .tabs {
          display: flex;
          flex-flow: row;
          background: $secondary;

          & > div {
            cursor: pointer;
            background: rgba(255, 255, 255, 0.05);
            padding: 0.75rem 1.5rem;

            &:hover {
              background: darken($secondary, 1%);
            }

            &.active {
              background: $primary;
            }
          }
        }

        .content {
          flex-grow: 1;
          overflow: auto;
          background: $primary;
        }
      }
    }
  }
</style>
