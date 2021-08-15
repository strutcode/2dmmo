import Node from '../Node'

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
}
