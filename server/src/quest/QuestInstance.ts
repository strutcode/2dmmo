import BaseObjective from '../BaseObjective'
import QuestTemplate from './QuestTemplate'

type VariableInstance = {
  type: 'stage' | 'actor' | 'prop'
  filter: any
  value: any
}

export default class QuestInstance {
  public ready = false
  public variables: Record<string, VariableInstance> = {}
  public currentObjective?: BaseObjective

  public constructor(public template: QuestTemplate) {
    template.variables.forEach((variable) => {
      this.variables[variable.name] = {
        type: variable.type,
        filter: variable.filter,
        value: null,
      }
    })
  }

  public get name() {
    return this.template.name
  }
}
