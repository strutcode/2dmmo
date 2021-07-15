import BaseObjective from '../BaseObjective'
import Player from '../components/Player'
import QuestTemplate from './QuestTemplate'

type VariableInstance = {
  type: 'stage' | 'actor' | 'prop'
  filter: any
  value: any
}

export default class QuestInstance {
  public ready = false
  public variables: Record<string, VariableInstance> = {}
  public objectives: BaseObjective[] = []
  private sceneIndex = 0

  public constructor(public template: QuestTemplate, public owner: Player) {
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

  public get currentObjective() {
    return this.objectives[this.sceneIndex]
  }
}
