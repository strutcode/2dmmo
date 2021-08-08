<template>
  <div class="rete" ref="rete"></div>
</template>

<script lang="ts">
  import Vue from 'vue'
  import Rete, { Component } from 'rete'
  import ConnectionPlugin from 'rete-connection-plugin'
  import VueRenderPlugin from 'rete-vue-render-plugin'
  import ContextMenuPlugin from 'rete-context-menu-plugin'
  import NodeParser from '../quests/NodeParser'

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

      NodeParser.getNodes().forEach((node: Component) => {
        editor.register(node)
      })
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

    .socket.flow {
      background: rgb(231, 238, 245) !important;
    }

    .socket.number {
      background: rgb(231, 145, 47) !important;
    }

    .socket.string {
      background: rgb(228, 206, 107) !important;
    }

    .socket.mobile {
      background: rgb(134, 124, 236) !important;
    }

    .socket.item {
      background: rgb(138, 210, 229) !important;
    }

    .socket.location {
      background: rgb(99, 204, 174) !important;
    }

    .socket.regex {
      background: rgb(208, 107, 218) !important;
    }
  }
</style>
