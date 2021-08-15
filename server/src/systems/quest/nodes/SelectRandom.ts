import Node from '../Node'

export default class SelectRandom extends Node {
  public static get outputs() {
    return [
      {
        name: '1',
        type: 'Flow',
        label: '',
      },
      {
        name: '2',
        type: 'Flow',
        label: '',
      },
      {
        name: '3',
        type: 'Flow',
        label: '',
      },
      {
        name: '4',
        type: 'Flow',
        label: '',
      },
      {
        name: '5',
        type: 'Flow',
        label: '',
      },
    ]
  }
}
