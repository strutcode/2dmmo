import BaseObjective from '../BaseObjective'
import QuestTemplate from './QuestTemplate'

export default class QuestInstance {
  public ready = false
  public variables = {}
  public currentObjectives: BaseObjective[] = []

  public constructor(public template: QuestTemplate) {}

  public get name() {
    return this.template.name
  }
}
