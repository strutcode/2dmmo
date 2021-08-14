type VariableTemplate = {
  type: 'stage' | 'actor' | 'prop'
  name: string
  filter: any
}

type QuestScene = {
  objective?: QuestObjective
  nodes?: QuestNode[]
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

type QuestAction = {
  type: string
  params: Record<string, any>
}

export default class QuestTemplate {
  public variables: VariableTemplate[] = []
  public scenes: QuestScene[] = []

  public constructor(public version: string, public name: string) {}
}
