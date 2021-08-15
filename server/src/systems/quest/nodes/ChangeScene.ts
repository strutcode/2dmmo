import Node from '../Node'

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
}
