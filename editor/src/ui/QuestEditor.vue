<template>
  <div class="rete" ref="rete"></div>
</template>

<script lang="ts">
  import Vue from 'vue'
  import Rete, { Component, Node } from 'rete'
  import ConnectionPlugin from 'rete-connection-plugin'
  import VueRenderPlugin from 'rete-vue-render-plugin'
  import ContextMenuPlugin from 'rete-context-menu-plugin'
  import { NodeData, WorkerInputs, WorkerOutputs } from 'rete/types/core/data'

  const numSocket = new Rete.Socket('Number')

  class NumComponent extends Rete.Component {
    constructor() {
      super('Number')
    }

    public async builder(node: Node) {
      let out = new Rete.Output('num', 'Number', numSocket)

      node.addOutput(out)
    }

    public worker(
      node: NodeData,
      inputs: WorkerInputs,
      outputs: WorkerOutputs,
    ) {
      outputs['num'] = node.data.num
    }
  }

  export default Vue.extend({
    mounted() {
      const container = this.$refs.rete as HTMLDivElement
      const editor = new Rete.NodeEditor('demo@0.1.0', container)

      editor.use(ConnectionPlugin)
      editor.use(VueRenderPlugin)
      editor.use(ContextMenuPlugin, {
        searchBar: false,
        delay: 100,
        allocate(component: Component) {
          return ['Submenu']
        },
        rename(component: Component) {
          return component.name
        },
        items: {
          'Click me'() {
            console.log('Works!')
          },
        },
      })

      const numComponent = new NumComponent()
      editor.register(numComponent)
    },
  })
</script>

<style lang="scss" scoped>
  .rete {
    position: absolute;
    top: 0;
    left: 0;
    bottom: 0;
    right: 0;
  }
</style>

<style lang="scss">
  @import '../style/vars';

  .rete {
    .node {
      border-radius: 2px !important;
      background: $secondary !important;
      border-color: $primary !important;

      &.selected {
        background: $secondary !important;
        border-color: rgb(110, 183, 243) !important;
      }
    }

    .socket.number {
      background: rgb(245, 162, 68) !important;
    }
  }
</style>
