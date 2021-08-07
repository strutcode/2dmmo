import BaseBehavior from '../BaseBehavior'
import BaseObjective from '../BaseObjective'

type VariableTemplate = {
  type: 'stage' | 'actor' | 'prop'
  name: string
  filter: any
}

type QuestScene = {
  objective: QuestObjective
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
