import Listener from '../../../components/Listener'
import Mobile from '../../../components/Mobile'
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

  public execute(context: QuestInstance, inputs: any) {
    const mob = inputs.listener as Mobile
    const match = inputs.match as RegExp
    let next = false

    if (mob) {
      mob.entity.with(Listener, (listener) => {
        listener.incoming.forEach((message) => {
          if (message.speaker !== mob.entity.id) {
            if (match.test(message.words)) {
              next = true
            }
          }
        })
      })
    }

    return {
      next,
    }
  }
}
