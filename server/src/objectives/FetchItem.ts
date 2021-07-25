import BaseObjective from '../BaseObjective'
import QuestParser from '../quest/QuestParser'

export default class FetchItem extends BaseObjective {
  public params = {
    for: {
      kind: 'actor',
      required: true,
      value: null as string | null,
    },
    item: {
      kind: 'prop',
      required: true,
      value: null as string | null,
    },
    location: {
      kind: 'stage',
      required: true,
      value: null as string | null,
    },
  }

  public location = null

  public setup() {
    if (this.params.location.value) {
      const locationVal = QuestParser.interpretValue(this.params.location.value)

      if (locationVal[0].type === 'var') {
        const questVar = this.quest.variables[locationVal[0].name]

        this.location = questVar.value
        console.log(this.location)
      }
    }
  }
}
