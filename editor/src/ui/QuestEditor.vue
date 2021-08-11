<template>
  <div v-if="questVersion < 2">
    Cannot edit this quest. Editor is only for versions 2+, quest version is
    {{ questVersion }}.
  </div>
  <div v-else class="questEditor">
    <div class="rete" ref="rete"></div>
    <div class="vars">
      <div class="header">
        <div class="title">Variables</div>
        <div>
          <button @click="createVariable">+</button>
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
  import { Component, NodeEditor, Connection } from 'rete'
  import ConnectionPlugin from 'rete-connection-plugin'
  import VueRenderPlugin from 'rete-vue-render-plugin'
  import ContextMenuPlugin from 'rete-context-menu-plugin'
  import NodeParser, { Variable, VariableNode } from '../quests/NodeParser'
  import QuestSerializer from '../quests/QuestSerializer'

  export default Vue.extend({
    props: {
      document: {
        type: Object,
      },
    },

    data() {
      return {
        questVersion: 2,
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

      editor.on('keydown', (e) => {
        switch (e.code) {
          case 'Delete':
            editor.selected.each((n) => editor.removeNode(n))
            break

          case 'Space':
            let rect = editor.view.container.getBoundingClientRect()
            let event = new MouseEvent('contextmenu', {
              clientX: rect.left + rect.width / 2,
              clientY: rect.top + rect.height / 2,
            })

            editor.trigger('contextmenu', { e: event, view: editor.view })
            break
        }
      })

      // Maybe someday box select
      // editor.view.container.addEventListener('pointerdown', (ev) => {
      //   ev.preventDefault()
      //   ev.stopPropagation()
      // })
      // editor.view.container.addEventListener('pointerup', (ev) => {
      //   editor.nodes.forEach((node) => {
      //     const el = node.vueContext?.$el
      //     const bounds = el.getBoundingClientRect()
      //   })
      // })

      this.editor = editor
      window.editor = editor

      this.loadDocument()
    },

    methods: {
      createVariable() {
        const name = prompt('Variable name')
        const type = prompt('Variable type')

        if (name && type) {
          this.addVariable({
            name,
            type,
          })
        }
      },

      addVariable(data: Variable) {
        this.variables.push(data)

        this.menuItems.Variables ??= {}
        this.menuItems.Variables[data.name] = async () => {
          const node = await this.editor
            .getComponent('Variable')
            .createNode(data)

          node.position[0] = this.editPos.x
          node.position[1] = this.editPos.y

          this.editor.addNode(node)
        }
      },

      async loadDocument() {
        const result = QuestSerializer.deserialize(this.document.content)

        this.questVersion = Number(result.version)

        if (this.questVersion < 2) {
          return
        }

        this.addVariable({
          name: 'soandso',
          type: 'Player',
        })
        result.variables.map(this.addVariable)

        await Promise.all(
          result.nodes.map(async (node) => {
            const reteNode = await this.editor
              .getComponent(node.type)
              .createNode(node.data)
            reteNode.id = node.id
            this.editor.addNode(reteNode)
          }),
        )

        result.edges.map((edge) => {
          const srcNode = this.editor.nodes.find((n) => n.id === edge.sourceId)
          const tgtNode = this.editor.nodes.find((n) => n.id === edge.targetId)
          const srcSock = srcNode?.outputs.get(edge.sourceSocket)
          const tgtSock = tgtNode?.inputs.get(edge.targetSocket)

          if (srcNode && tgtNode && srcSock && tgtSock) {
            const conn = srcSock.connectTo(tgtSock)
            this.editor.view.addConnection(conn)
          } else {
            console.warn(
              `Failed to connect edge: ${edge.sourceId}:${edge.sourceSocket}->${edge.targetId}:${edge.targetSocket}`,
            )
          }
        })
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
