import { Node } from 'rete'

export default class QuestSerializer {
  public static serialize(variables: any[], source: any) {
    const output = {
      version: '2',
      resources: variables.reduce((obj, variable) => {
        obj[variable.name] = {
          type: variable.type,
        }

        return obj
      }, {}),
      scenes: [
        {
          nodes: [] as any[],
          edges: [] as any[],
        },
      ],
    }

    const connections = new Set<string>()

    if (source?.nodes) {
      Object.values(source.nodes as Record<number, Node>).forEach(
        (node: Node) => {
          const outNode = {
            type: node.name,
            data: node.data,
          }

          if (node.outputs) {
            Object.entries(node.outputs).forEach(([name, socket]) => {
              socket.connections.forEach((connection: any) => {
                const key = `${node.id}:${name}->${connection.node}:${connection.input}`

                if (!connections.has(key)) {
                  output.scenes[0].edges.push({
                    sourceId: node.id,
                    sourceSocket: name,
                    targetId: connection.node,
                    targetSocket: connection.input,
                  })

                  connections.add(key)
                }
              })
            })
          }

          output.scenes[0].nodes.push(outNode)
        },
      )
    }

    return output
  }

  public static deserialize(data: any) {}
}
