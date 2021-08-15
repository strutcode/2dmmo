type VariableTemplate = {
  type: 'stage' | 'actor' | 'prop'
  name: string
  filter: any
}

type QuestScene = {
  objective?: QuestObjective
  nodes?: QuestNode[]
  edges?: QuestEdge[]
}

type QuestObjective = {
  type: string
  params: Record<string, any>
  actions: QuestAction[]
}

type QuestNode = {
  type: string
  data: Record<string, unknown>
  meta?: Record<string, unknown>
}

type QuestEdge = {
  sourceId: number
  sourceSocket: string
  targetId: number
  targetSocket: string
}

type QuestAction = {
  type: string
  params: Record<string, any>
}

export default class QuestTemplate {
  public variables: VariableTemplate[] = []
  public scenes: QuestScene[] = []

  public constructor(public version: string, public name: string) {}
}
