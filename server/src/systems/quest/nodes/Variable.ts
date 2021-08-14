import Node from './Node'

export default class Variable extends Node {
  public static get outputs() {
    return [
      {
        name: 'value',
        type: 'Any',
        label: 'Value',
      },
    ]
  }
}
