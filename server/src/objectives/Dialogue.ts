import BaseObjective from '../BaseObjective'
import QuestParser from '../quest/QuestParser'

export default class Dialogue extends BaseObjective {
  public params = {
    who: {
      kind: 'mobile',
      required: true,
      value: null,
    },
    lines: {
      kind: 'dialogue',
      required: true,
      value: null,
    },
  }

  public setup() {
    if (this.params.who.value) {
      const whoValue = QuestParser.interpretValue(this.params.who.value)

      console.log(whoValue[0].name, this.quest.variables[whoValue[0].name])
    }
  }

  public update() {}
}
