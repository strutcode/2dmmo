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
  .filter((key) => !key.endsWith('Trigger.ts') && !key.endsWith('Node.ts'))
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

export class VariableNode extends BaseNode {
  constructor() {
    super('Variable')
  }

  public async builder(node: Node) {
    const data = node.data as Variable

    node.addOutput(
      new Output('value', data.name, NodeParser.getType(data.name)),
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
    const parsedNodes = nodes.map((nodeClass) => {
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

          // node.addControl()

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

    return this.getBasicNodes().concat(parsedNodes)
  }

  public static getBasicNodes() {
    class TextControl extends Control {
      public constructor() {
        super('text')

        this.component = {
          props: ['ikey', 'getData', 'putData'],
          render(h) {
            return h('input', {
              attrs: { type: 'text' },
              props: { value: this.value },
              on: {
                input: (ev) => {
                  this.change(ev)
                },
              },
            })
          },
          data() {
            return {
              value: 0,
            }
          },
          methods: {
            change(e) {
              this.value = +e.target.value
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
          ikey: 'text',
          getData: this.getData.bind(this),
          putData: this.putData.bind(this),
        }
      }

      public setValue(val) {
        this.vueContext.value = val
      }
    }

    class TextNode extends BaseNode {
      public constructor() {
        super('Constant Text')
      }

      public async builder(node: Node) {
        node.addControl(new TextControl())
        node.addOutput(
          new Output('value', 'Value', NodeParser.getType('String')),
        )
      }
    }

    class NumberNode extends BaseNode {
      public constructor() {
        super('Constant Number')
      }

      public async builder(node: Node) {
        node.addControl(new TextControl())
        node.addOutput(
          new Output('value', 'Value', NodeParser.getType('Number')),
        )
      }
    }

    return [new TextNode(), new NumberNode()]
  }
}
