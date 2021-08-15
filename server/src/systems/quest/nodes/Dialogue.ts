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
        name: 'lines',
        type: 'String',
        label: 'Lines',
      },
    ]
  }

  public execute(context: QuestInstance, input: any) {
    console.log(input.lines)

    return {
      next: true,
    }
  }
}
