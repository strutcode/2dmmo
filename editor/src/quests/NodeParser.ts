import { Component, Input, Node, Output, Socket } from 'rete'

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

export default class NodeParser {
  public static types = new Map<string, Socket>()

  public static getNodes() {
    if (!this.types.has('Flow')) {
      this.types.set('Flow', new Socket('Flow'))
    }

    const flowType = this.types.get('Flow') as Socket

    return nodes.map((nodeClass) => {
      class ParsedNode extends Component {
        constructor() {
          super(nodeClass.name)
        }

        public async builder(node: Node) {
          node.addInput(new Input('prev', 'Flow', flowType))
          node.addOutput(new Output('next', 'Flow', flowType))

          nodeClass.inputs.forEach((input: any) => {
            if (!NodeParser.types.has(input.type)) {
              NodeParser.types.set(input.type, new Socket(input.type))
            }

            const socket = NodeParser.types.get(input.type) as Socket

            node.addInput(new Input(input.name, input.label, socket))
          })

          nodeClass.outputs.forEach((output: any) => {
            if (!NodeParser.types.has(output.type)) {
              NodeParser.types.set(output.type, new Socket(output.type))
            }

            const socket = NodeParser.types.get(output.type) as Socket

            node.addOutput(new Output(output.name, output.label, socket))
          })
        }

        public async worker() {}
      }

      return new ParsedNode()
    })
  }
}
