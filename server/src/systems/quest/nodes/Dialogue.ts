import Mobile from '../../../components/Mobile'
import Speaker from '../../../components/Speaker'
import Node from '../Node'
import QuestInstance from '../QuestInstance'

export default class Dialogue extends Node {
  public static get inputs() {
    return [
      {
        name: 'prev',
        type: 'Flow',
        label: '',
      },
      {
        name: 'speaker',
        type: 'Mobile',
        label: 'Speaker',
      },
      {
        name: 'lines',
        type: 'String',
        label: 'Lines',
      },
    ]
  }

  public execute(context: QuestInstance, input: any) {
    const mob = input.speaker as Mobile
    const lines = input.lines as string

    if (mob) {
      mob.entity.with(Speaker, (speaker) => {
        speaker.say(lines)
      })
    }

    return {
      next: true,
    }
  }
}
