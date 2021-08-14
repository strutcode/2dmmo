<template>
  <div class="container">
    <div class="menu">
      <div class="navigation">
        <div>Players</div>
        <div>NPCs</div>
        <div class="active">Quests</div>
        <div>Items</div>
        <div>Maps</div>
      </div>
      <div class="status">
        <network-status></network-status>
      </div>
    </div>
    <div class="editor">
      <div class="listView">
        <div
          class="listItem"
          v-for="file in files"
          :key="file.name"
          @click="loadQuest(file)"
        >
          <div class="title">{{ file.name }}</div>
          <div class="controls">
            <button @click.stop="deleteQuest(file.name)">X</button>
          </div>
        </div>
        <div class="listItem">
          <button @click="createQuest">New file</button>
        </div>
      </div>
      <div class="main">
        <div class="tabs">
          <div
            v-for="document in documents"
            class="tab"
            :class="{ active: document === activeDocument }"
            @click="activeDocument = document"
            :key="document.title"
          >
            <div class="title">
              {{ document.title }}
            </div>
            <div class="closer" @click.stop="closeDocument(document)">
              <span>X</span>
            </div>
          </div>
        </div>
        <div class="content">
          <quest-editor
            v-if="activeDocument"
            :document="activeDocument"
            @save="saveQuest"
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
      async createQuest() {
        const name = prompt('Enter a name for the quest')

        if (name) {
          await client.createDocument('quests', name)
          this.files = await client.getQuests()
        }
      },

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

      async deleteQuest(name: string) {
        await client.deleteDocument('quests', name)
        this.files = await client.getQuests()
      },

      async saveQuest(content: string) {
        if (this.activeDocument) {
          await client.saveDocument(
            'quests',
            this.activeDocument.title,
            content,
          )
        }
      },

      closeDocument(doc: Document) {
        const index = this.documents.findIndex((d) => d === doc)

        if (index !== -1) {
          // Find the new active document and highlight it
          if (this.activeDocument === doc) {
            if (this.documents[index + 1]) {
              this.activeDocument = this.documents[index + 1]
            } else if (this.documents[index - 1]) {
              this.activeDocument = this.documents[index - 1]
            } else {
              this.activeDocument = null
            }
          }

          // Actually delete the old document
          this.documents.splice(index, 1)
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

          &.active {
            background: $secondary;
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

        .listItem {
          display: flex;

          .title,
          .controls {
            padding: 0.34rem 0.68rem;
          }

          .title {
            flex-grow: 1;
            cursor: pointer;
          }

          &:hover {
            background: rgba(0, 0, 0, 0.25);
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

          .tab {
            display: flex;
            cursor: pointer;
            height: 3rem;
            align-items: center;

            .title {
              padding: 0 1.5rem;
            }

            .closer {
              padding: 0 0.34rem;
              span {
                display: inline-block;
                vertical-align: middle;
                padding: 0.22rem 0.44rem;
                visibility: hidden;
              }

              &:hover {
                span {
                  background: rgba(255, 255, 255, 0.05);
                }
              }
            }

            &:hover {
              background: darken($secondary, 1%);

              .closer span {
                visibility: visible;
              }
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
