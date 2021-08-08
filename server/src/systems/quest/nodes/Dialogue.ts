import Node from './Node'

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
}
