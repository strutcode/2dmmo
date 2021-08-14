import QuestTemplate from '../QuestTemplate'

type QuestSource = {
  version: string
  resources: Record<string, QuestVariable>
  scenes: QuestScene[]
}

type QuestVariable = {
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

    template.scenes = input.scenes

    return template
  }
}
