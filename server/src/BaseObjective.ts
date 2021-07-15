import Engine from '../../common/engine/Engine'
import QuestInstance from './quest/QuestInstance'

type ObjectiveParameters = {
  [name: string]: {
    kind: string
    required: boolean
    value: any
  }
}

export default class BaseObjective {
  public params: ObjectiveParameters = {}

  public constructor(
    protected engine: Engine,
    protected quest: QuestInstance,
  ) {}

  public setup() {}

  public update() {}
}
