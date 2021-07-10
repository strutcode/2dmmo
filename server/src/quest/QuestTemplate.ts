import BaseBehavior from '../BaseBehavior'
import BaseObjective from '../BaseObjective'

type VariableTemplate = {
  type: 'stage' | 'actor' | 'prop'
  filter: any
}

type QuestStage = {
  objectives: QuestObjective[]
}

type QuestObjective = {
  Prototype: typeof BaseObjective
  params: Record<string, any>
  actions: QuestAction[]
}

type QuestAction = {
  Prototype: typeof BaseBehavior
  params: Record<string, any>
}

export default class QuestTemplate {
  public variables: VariableTemplate[] = []
  public stages: QuestStage[] = []
}
