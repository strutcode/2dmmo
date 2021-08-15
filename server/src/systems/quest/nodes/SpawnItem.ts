import Item from '../../../components/Item'
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
      {
        name: 'location',
        type: 'Location',
        label: 'Location',
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

  public execute(context: QuestInstance, input: any) {
    const item = input.item as Item
    const location = input.location as { x: number; y: number }

    if (item && location) {
      item.desiredLocation = {
        type: 'world',
        target: location,
      }
    }

    return {
      next: true,
    }
  }
}
