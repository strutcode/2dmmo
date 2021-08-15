import QuestInstance from '../QuestInstance'
import Trigger from '../Trigger'

export default class TriggerSpeech extends Trigger {
  public static get inputs() {
    return [
      {
        name: 'prev',
        type: 'Flow',
        label: '',
      },
      {
        name: 'listener',
        type: 'Mobile',
        label: 'Listener',
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
