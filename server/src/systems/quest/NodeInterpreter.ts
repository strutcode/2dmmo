import Node from './nodes/Node'

export default class NodeInterpreter {
  protected nodes: Node[] = []
  protected activeNodes: Node[] = []

  public constructor() {}

  public addNode(node: Node) {
    this.nodes.push(node)
  }

  public start() {
    const startNode = this.nodes.find((node) => node.name === 'SceneStart')

    if (startNode) {
      this.activeNodes = [startNode]
      this.update()
    } else {
      console.log('Node not found')
    }
  }

  public update() {
    this.activeNodes.forEach((node) => {
      node.execute()
    })
  }
}
