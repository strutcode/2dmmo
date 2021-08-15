import { Component, Control, Input, Node, Output, Socket } from 'rete'
import Vue from 'vue'
import ReteNode from '../ui/ReteNode.vue'

const ctx = require.context(
  '../../../server/src/systems/quest/nodes/',
  true,
  /\.ts$/,
)

const nodes = ctx
  .keys()
  .filter((key) => !key.endsWith('Variable.ts'))
  .map((key) => {
    return ctx(key).default
  })

export type Variable = {
  name: string
  type: string
}

class BaseNode extends Component {
  constructor(name: string) {
    super(name)
    ;(this.data as any).component = ReteNode
  }

  public async builder(node: Node) {}

  public async worker(...args: Parameters<Component['worker']>) {}
}

class TextControl extends Control {
  public constructor(ikey: string, node: Node) {
    super(ikey)

    this.component = {
      props: ['ikey', 'value', 'getData', 'putData'],
      render(h) {
        return h('input', {
          attrs: { type: 'text', value: this.value },
          on: {
            input: (ev) => {
              this.change(ev)
            },
          },
        })
      },
      methods: {
        change(e) {
          // this.value = e.target.value
          this.update()
        },
        update() {
          if (this.ikey) this.putData(this.ikey, this.value)
          // this.emitter.trigger('process')
        },
      },
      mounted() {
        this.value = this.getData(this.ikey)
      },
    }
    this.props = {
      ikey,
      value: node.data[ikey],
      getData: this.getData.bind(this),
      putData: this.putData.bind(this),
    }
  }

  public setValue(val) {
    this.props.value = val
  }
}

export class VariableNode extends BaseNode {
  constructor() {
    super('Variable')
  }

  public async builder(node: Node) {
    const data = node.data as Variable

    node.addOutput(
      new Output('value', data.name, NodeParser.getType(data.type)),
    )
  }
}

export default class NodeParser {
  public static types = new Map<string, Socket>()

  public static getType(name: string): Socket {
    if (!NodeParser.types.has(name)) {
      NodeParser.types.set(name, new Socket(name))
    }

    return NodeParser.types.get(name) as Socket
  }

  public static getNodes() {
    return nodes.map((nodeClass) => {
      class ParsedNode extends BaseNode {
        constructor() {
          super(nodeClass.name)
        }

        public async builder(node: Node) {
          nodeClass.inputs.forEach((input: any) => {
            node.addInput(
              new Input(
                input.name,
                input.label,
                NodeParser.getType(input.type),
                true,
              ),
            )
          })

          nodeClass.values.forEach((value: any) => {
            node.addControl(new TextControl(value.name, node))
          })

          nodeClass.outputs.forEach((output: any) => {
            node.addOutput(
              new Output(
                output.name,
                output.label,
                NodeParser.getType(output.type),
                true,
              ),
            )
          })
        }

        public async worker() {}
      }

      return new ParsedNode()
    })
  }
}
