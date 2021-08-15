import QuestTemplate from '../QuestTemplate'

type QuestSource = {
  version: string
  resources: Record<string, QuestVariable>
  scenes: QuestScene[]
}

type QuestVariable = {
  type: string
  requirements: Record<string, unknown>
}

type QuestScene = {
  nodes: NodeSource[]
  edges: EdgeSource[]
}

type NodeSource = {
  type: string
  data: Record<string, unknown>
  meta?: Record<string, unknown>
}

type EdgeSource = {
  sourceId: number
  sourceSocket: string
  targetId: number
  targetSocket: string
}

export default class QuestParserV2 {
  public static parse(name: string, input: QuestSource) {
    const template = new QuestTemplate(input.version, name)

    if (input.resources) {
      const typeMap = {
        Mobile: 'actor',
        Item: 'prop',
        Location: 'stage',
      } as Record<string, 'actor' | 'prop' | 'stage'>

      for (let key in input.resources) {
        const value = input.resources[key]
        const type = typeMap[value.type]

        if (!type) {
          console.error(`Invalid type ${value.type} in quest ${name}`)
        }

        template.variables.push({
          type,
          name: key,
          filter: null,
        })
      }
    }

    template.scenes = input.scenes

    return template
  }
}
