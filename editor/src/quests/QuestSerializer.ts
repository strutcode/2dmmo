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
      const sourceNodes = Object.values(source?.nodes as Record<number, Node>)

      sourceNodes.forEach((node: Node, nodeIndex) => {
        const outNode = {
          type: node.name,
          data: node.data,
          meta: {
            x: node.position[0],
            y: node.position[1],
          },
        }

        if (node.outputs) {
          Object.entries(node.outputs).forEach(([name, socket]) => {
            socket.connections.forEach((connection: any) => {
              const srcId = nodeIndex
              const srcSock = name
              const dstId = sourceNodes.findIndex(
                (n) => n.id === connection.node,
              )
              const dstSock = connection.input
              const key = `${srcId}:${srcSock}->${dstId}:${dstSock}`

              if (!connections.has(key)) {
                output.scenes[0].edges.push({
                  sourceId: srcId,
                  sourceSocket: srcSock,
                  targetId: dstId,
                  targetSocket: dstSock,
                })

                connections.add(key)
              }
            })
          })
        }

        output.scenes[0].nodes.push(outNode)
      })
    }

    return output
  }

  public static deserialize(source: string) {
    const data = JSON.parse(source)
    const version = data.version

    if (version !== '2') {
      return {
        version,
      }
    }

    const variables = []
    const nodes = []
    const edges = []

    for (let name in data.resources) {
      variables.push({
        name,
        type: data.resources[name].type,
      })
    }

    data.scenes[0].nodes.forEach((node, index) => {
      nodes.push({
        id: index,
        type: node.type,
        data: node.data,
        meta: node.meta,
      })
    })

    data.scenes[0].edges.forEach((edge) => {
      edges.push(edge)
    })

    return {
      version,
      variables,
      nodes,
      edges,
    }
  }
}
