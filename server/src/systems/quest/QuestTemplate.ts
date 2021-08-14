import Node from './nodes/Node'

type VariableTemplate = {
  type: 'stage' | 'actor' | 'prop'
  name: string
  filter: any
}

type QuestScene = {
  objective?: QuestObjective
  nodes?: Node
}

type QuestObjective = {
  type: string
  params: Record<string, any>
  actions: QuestAction[]
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
