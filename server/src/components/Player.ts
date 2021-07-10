import Component from '../../../common/engine/Component'
import QuestInstance from '../quest/QuestInstance'

export default class Player extends Component {
  public mainQuest?: QuestInstance
  public sideQuests: QuestInstance[] = []

  public get quests(): QuestInstance[] {
    const all = [...this.sideQuests]

    if (this.mainQuest) all.push(this.mainQuest)
    
    return all
  }
}
