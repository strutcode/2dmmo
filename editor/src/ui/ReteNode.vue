<template>
  <div class="node" :class="nodeClasses">
    <div class="title">
      {{ node.name }}
    </div>
    <div class="body">
      <div class="inputs">
        <div
          class="input"
          :class="[input.name]"
          v-for="input in inputs"
          :key="input.key"
        >
          <div
            class="socket"
            :class="[input.socket.name.toLowerCase()]"
            v-socket:input="input"
          ></div>
          <div class="label">{{ input.name }}</div>
        </div>
      </div>
      <div class="controls">
        <div
          class="control"
          v-for="control in controls"
          :key="control.key"
          v-control="control"
        ></div>
      </div>
      <div class="outputs">
        <div
          class="output"
          :class="[output.name]"
          v-for="output in outputs"
          :key="output.key"
        >
          <div class="label">{{ output.name }}</div>
          <div
            class="socket"
            :class="[output.socket.name.toLowerCase()]"
            v-socket:output="output"
          ></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
  import { Control, Input, Node, NodeEditor, Output } from 'rete'
  import Vue from 'vue'

  export default Vue.extend({
    props: {
      node: {
        type: Object as () => Node,
      },
      editor: {
        type: Object as () => NodeEditor,
      },
      bindSocket: {
        type: Function,
      },
      bindControl: {
        type: Function,
      },
    },

    directives: {
      socket: {
        bind(el, binding, vnode) {
          vnode?.context?.bindSocket(el, binding.arg, binding.value)
        },
        update(el, binding, vnode) {
          vnode?.context?.bindSocket(el, binding.arg, binding.value)
        },
      },
      control: {
        bind(el, binding, vnode) {
          if (!binding.value) return

          vnode?.context?.bindControl(el, binding.value)
        },
      },
    },

    computed: {
      inputs(): Input[] {
        return Array.from(this.node.inputs.values())
      },

      outputs(): Output[] {
        return Array.from(this.node.outputs.values())
      },

      controls(): Control[] {
        return Array.from(this.node.controls.values())
      },

      nodeClasses(): Record<string, boolean> {
        return {
          selected: this.editor.selected.contains(this.node),
        }
      },
    },
  })
</script>

<style lang="scss">
  @import '../style/vars';

  .node {
    border-radius: 4px;
    background: $secondary;
    border: 2px solid $primary;
    // opacity: 0.5;

    &.selected {
      background: $secondary !important;
      border-color: rgb(110, 183, 243) !important;
    }

    .title {
      background: $tertiary;
      padding: 0.34rem 1.82rem;
    }

    .body {
      display: flex;
      flex-flow: row nowrap;

      .inputs,
      .controls,
      .outputs {
        flex-grow: 1;
        white-space: nowrap;
      }

      .input,
      .output,
      .control {
        display: block;
        height: 2.24rem;
        line-height: 2.24rem;

        .label {
          display: inline-block;
        }
      }

      .socket {
        display: inline-block;
        width: 1.12rem;
        height: 1.12rem;
        border-radius: 50%;
        background: grey;
        vertical-align: middle;
      }

      .input {
        .socket {
          margin-left: -0.5rem;
        }
      }

      .control {
        padding: 0 1.12rem;

        input {
          height: 1.64rem;
          padding: 0 0.35rem;
          vertical-align: middle;
          background: $input;
          border: 0;
          outline: none;
          color: $text;
        }
      }

      .output {
        text-align: right;

        .socket {
          margin-right: -0.5rem;
        }
      }
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
</style>
