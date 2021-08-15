import Node from '../Node'

export default class Regex extends Node {
  public static get outputs() {
    return [
      {
        name: 'value',
        type: 'Regex',
        label: 'Value',
      },
    ]
  }

  public execute() {
    return {
      value: new RegExp(this.data.value),
    }
  }
}
