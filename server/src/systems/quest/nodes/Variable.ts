import Node from '../Node'
import QuestInstance from '../QuestInstance'

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

  public execute(context: QuestInstance) {
    return {
      value: context.variableValue(this.data.name),
    }
  }
}
