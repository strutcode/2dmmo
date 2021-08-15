import Link from './Link'
import Node from './Node'

export default class NodeInterpreter {
  protected nodes: Node[] = []
  protected activeNodes = new Set<Node>()

  public constructor() {}

  public getNode(index: number) {
    return this.nodes[index]
  }

  public addNode(node: Node) {
    this.nodes.push(node)
  }

  public addEdge(
    sourceNode: Node,
    sourceSocket: string,
    targetNode: Node,
    targetSocket: string,
  ) {
    const link = new Link(sourceNode, sourceSocket, targetNode, targetSocket)

    sourceNode.connections[sourceSocket] ??= []
    sourceNode.connections[sourceSocket].push(link)

    targetNode.connections[targetSocket] ??= []
    targetNode.connections[targetSocket].push(link)
  }

  public start(context: any) {
    const startNode = this.nodes.find((node) => node.name === 'SceneStart')

    if (startNode) {
      startNode.execute(context, {})
      this.activeNodes.clear()
      this.activeNodes.add(startNode)
      this.update(context)
    } else {
      console.log('Node not found')
    }
  }

  public update(context: any) {
    this.activeNodes.forEach((node) => {
      const output = node.execute(context, this.getInputsForNode(context, node))
      const next = node.outputs.find((out) => out.type === 'Flow')

      if (next && output[next.name]) {
        this.activeNodes.delete(node)

        node.connections[next.name]?.forEach((link) => {
          this.activeNodes.add(link.targetNode)
        })
      }
    })
  }

  protected getInputsForNode(context: any, node: Node) {
    const inputs: Record<string, unknown> = {}

    node.inputs.forEach((input) => {
      if (input.type == 'Flow') return

      node.connections[input.name]?.forEach((link) => {
        const output = link.sourceNode.execute(
          context,
          this.getInputsForNode(context, link.sourceNode),
        )

        inputs[input.name] = output[link.sourceSocket]
      })
    })

    return inputs
  }
}
