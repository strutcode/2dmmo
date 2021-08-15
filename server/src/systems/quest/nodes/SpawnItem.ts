import Node from '../Node'
import QuestInstance from '../QuestInstance'

export default class SpawnItem extends Node {
  public static get inputs() {
    return [
      {
        name: 'prev',
        type: 'Flow',
        label: '',
      },
      {
        name: 'item',
        type: 'Item',
        label: 'Item',
      },
    ]
  }

  public static get outputs() {
    return [
      {
        name: 'next',
        type: 'Flow',
        label: '',
      },
    ]
  }

  public execute(context: QuestInstance) {
    return {
      next: true,
    }
  }
}
