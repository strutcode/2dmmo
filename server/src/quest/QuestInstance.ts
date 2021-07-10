import BaseObjective from '../BaseObjective'

export default class QuestInstance {
  public variables = {}
  public currentObjectives: BaseObjective[] = []

  public constructor(public name: string) {}
}
