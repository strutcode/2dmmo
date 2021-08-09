<template>
  <div class="questEditor">
    <div class="rete" ref="rete"></div>
    <div class="vars">
      <div class="header">
        <div class="title">Variables</div>
        <div>
          <button @click="newVar">+</button>
        </div>
      </div>
      <div class="var" v-for="variable in variables" :key="variable.name">
        <div class="name">{{ variable.name }}</div>
        <div class="type">{{ variable.type }}</div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
  import Vue from 'vue'
  import { Component, NodeEditor } from 'rete'
  import ConnectionPlugin from 'rete-connection-plugin'
  import VueRenderPlugin from 'rete-vue-render-plugin'
  import ContextMenuPlugin from 'rete-context-menu-plugin'
  import NodeParser, { Variable, VariableNode } from '../quests/NodeParser'
  import QuestSerializer from '../quests/QuestSerializer'

  export default Vue.extend({
    data() {
      return {
        variables: [] as Variable[],
        editor: {} as NodeEditor,
        menuItems: {} as Record<string, any>,
        editPos: {
          x: 0,
          y: 0,
        },
      }
    },

    mounted() {
      const container = this.$refs.rete as HTMLDivElement
      const editor = new NodeEditor('demo@0.1.0', container)

      this.menuItems.Export = () => {
        console.log(
          'export',
          QuestSerializer.serialize(this.variables, editor.toJSON()),
        )
      }

      editor.use(ConnectionPlugin)
      editor.use(VueRenderPlugin)
      editor.use(ContextMenuPlugin, {
        searchBar: true,
        delay: 100,
        allocate(component: Component) {
          return []
        },
        rename(component: Component) {
          return component.name
        },

        items: this.menuItems,
      })

      NodeParser.getNodes().forEach((node: Component) => {
        editor.register(node)
      })
      editor.register(new VariableNode())

      editor.on('click', ({ e, node }) => {
        if (!node) {
          editor.selected.clear()
        }
      })

      editor.on('mousemove', (ev) => {
        this.editPos.x = ev.x
        this.editPos.y = ev.y
      })

      console.log(editor)
      this.editor = editor
    },

    methods: {
      newVar() {
        const name = prompt('Variable name')
        const type = prompt('Variable type')

        if (name && type) {
          const newVar: Variable = { name, type }

          this.variables.push(newVar)
          this.menuItems.Variables ??= {}
          this.menuItems.Variables[name] = async () => {
            const node = await this.editor
              .getComponent('Variable')
              .createNode(newVar)

            node.position[0] = this.editPos.x
            node.position[1] = this.editPos.y

            this.editor.addNode(node)
          }
        }
      },
    },
  })
</script>

<style lang="scss" scoped>
  @import '../style/vars';

  .questEditor {
    flex-grow: 1;
    display: flex;
    flex-flow: row nowrap;

    .rete {
      flex-grow: 1;
    }

    .vars {
      min-width: 16rem;
      background: $secondary;

      .header {
        display: flex;
        background: $tertiary;

        .title {
          flex-grow: 1;
          padding: 0.34rem;
        }
      }

      .var {
        display: flex;
        padding: 0.34rem;

        .name {
          flex-grow: 1;
        }
      }
    }
  }
</style>
