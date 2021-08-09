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
  import QuestSerializer from '../quests/QuestSerializer'

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
          return []
        },
        rename(component: Component) {
          return component.name
        },
        items: {
          Export() {
            console.log(
              'export',
              QuestSerializer.serialize([], editor.toJSON()),
            )
          },
        },
      })

      NodeParser.getNodes().forEach((node: Component) => {
        editor.register(node)
      })

      console.log(editor)
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
