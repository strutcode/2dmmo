<template>
  <div class="container">
    <div class="menu">
      <div class="navigation">
        <div>Players</div>
        <div>NPCs</div>
        <div>Quests</div>
        <div>Items</div>
        <div>Maps</div>
      </div>
      <div class="status">
        <network-status></network-status>
      </div>
    </div>
    <div class="editor">
      <div class="listView">
        <div v-for="file in files" :key="file.name" @click="loadQuest(file)">
          {{ file.name }}
        </div>
      </div>
      <div class="main">
        <div class="tabs">
          <div
            v-for="document in documents"
            :class="{ active: document === activeDocument }"
            @click="activeDocument = document"
            :key="document.title"
          >
            {{ document.title }}
          </div>
        </div>
        <div class="content">
          <quest-editor
            v-if="activeDocument"
            :document="activeDocument"
            :key="activeDocument.title"
          ></quest-editor>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
  import Vue from 'vue'

  import client from '../network/Client'
  import NetworkStatus from './NetworkStatus.vue'
  import QuestEditor from './QuestEditor.vue'

  interface File {
    name: string
  }

  interface Document {
    title: string
    content: any
  }

  export default Vue.extend({
    components: {
      QuestEditor,
      NetworkStatus,
    },

    data() {
      return {
        files: [] as File[],
        documents: [] as Document[],
        activeDocument: null as Document | null,
      }
    },

    async created() {
      this.files = await client.getQuests()
    },

    methods: {
      async loadQuest(file: File) {
        const quest = await client.loadQuest(file.name)
        const doc = {
          title: quest.name,
          content: quest.content,
        }

        const existing = this.documents.find((d) => d.content === doc.content)

        if (existing) {
          this.activeDocument = existing
        } else {
          this.documents.push(doc)
          this.activeDocument = doc
        }
      },
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

    .menu {
      display: flex;
      flex-flow: row nowrap;
      background: $menu;

      .navigation {
        display: flex;
        flex-flow: row nowrap;

        & > div {
          cursor: pointer;
          padding: 0.5rem 1rem;
          border-right: 2px solid rgba(0, 0, 0, 0.2);

          &:hover {
            background: rgba(0, 0, 0, 0.25);
          }
        }
      }

      .status {
        display: flex;
        flex-flow: row nowrap;
        align-items: center;
        justify-content: flex-end;
        flex-grow: 1;
        text-align: right;
        padding: 0 0.84rem;
      }
    }

    .editor {
      flex-grow: 1;
      display: flex;
      flex-flow: row nowrap;

      .listView {
        width: 20%;
        background: $secondary;

        & > div {
          padding: 0.34rem 0.68rem;

          &:hover {
            background: rgba(255, 255, 255, 0.1);
          }
        }
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
          display: flex;
          position: relative;
          flex-grow: 1;
          overflow: auto;
          background: $primary;
        }
      }
    }
  }
</style>
