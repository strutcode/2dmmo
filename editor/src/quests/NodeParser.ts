import { Component, Control, Input, Node, Output, Socket } from 'rete'
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

export class VariableNode extends Component {
  constructor(private variable: Variable) {
    super('Variable')

    this.data.component = ReteNode
  }

  public async builder(node: Node) {
    const type = NodeParser.types.get(this.variable.type)

    if (type) {
      node.addOutput(new Output('value', this.variable.name, type))
    }
  }

  public async worker() {}
}

export default class NodeParser {
  public static types = new Map<string, Socket>()

  public static getNodes() {
    return nodes.map((nodeClass) => {
      class ParsedNode extends Component {
        constructor() {
          super(nodeClass.name)

          this.data.component = ReteNode
        }

        public async builder(node: Node) {
          nodeClass.inputs.forEach((input: any) => {
            if (!NodeParser.types.has(input.type)) {
              NodeParser.types.set(input.type, new Socket(input.type))
            }

            const socket = NodeParser.types.get(input.type) as Socket

            node.addInput(new Input(input.name, input.label, socket, true))
          })

          // node.addControl()

          nodeClass.outputs.forEach((output: any) => {
            if (!NodeParser.types.has(output.type)) {
              NodeParser.types.set(output.type, new Socket(output.type))
            }

            const socket = NodeParser.types.get(output.type) as Socket

            node.addOutput(new Output(output.name, output.label, socket, true))
          })
        }

        public async worker() {}
      }

      return new ParsedNode()
    })
  }

  public static getVariableNode(variable: Variable) {
    return new VariableNode(variable)
  }
}
