import Node from '../Node'
import QuestInstance from '../QuestInstance'

export default class ChangeScene extends Node {
  public static get inputs() {
    return [
      {
        name: 'prev',
        type: 'Flow',
        label: '',
      },
      {
        name: 'index',
        type: 'Number',
        label: 'Scene',
      },
    ]
  }
  public execute(context: QuestInstance) {
    context.advance()

    return {}
  }
}
