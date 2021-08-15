import Node from '../Node'
import QuestInstance from '../QuestInstance'

export default class TriggerSpeech extends Node {
  public static get inputs() {
    return [
      {
        name: 'prev',
        type: 'Flow',
        label: '',
      },
      {
        name: 'match',
        type: 'Regex',
        label: 'Match',
      },
    ]
  }

  public execute(context: QuestInstance) {
    return {
      next: true,
    }
  }
}
