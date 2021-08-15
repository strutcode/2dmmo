import Node from '../Node'

export default class Text extends Node {
  public static get outputs() {
    return [
      {
        name: 'value',
        type: 'String',
        label: 'Value',
      },
    ]
  }

  public execute() {
    return {
      value: this.data.value,
    }
  }
}
