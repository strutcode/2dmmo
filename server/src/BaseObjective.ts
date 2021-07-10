import Engine from '../../common/engine/Engine'
import QuestInstance from './quest/QuestInstance'

export default class BaseObjective {
  public constructor(private engine: Engine) {}

  public update(quest: QuestInstance) {}
}
