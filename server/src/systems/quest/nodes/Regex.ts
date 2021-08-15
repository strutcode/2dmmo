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

  public static get values() {
    return [
      {
        name: 'match',
        type: 'Regex',
        label: 'Match',
      },
    ]
  }

  public execute() {
    return {
      value: new RegExp(this.data.match),
    }
  }
}
