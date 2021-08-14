import Node from './Node'

export default class Number extends Node {
  public static get outputs() {
    return [
      {
        name: 'value',
        type: 'Number',
        label: 'Value',
      },
    ]
  }
}
