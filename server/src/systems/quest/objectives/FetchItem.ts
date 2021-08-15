import BaseObjective from '../../../BaseObjective'
import WorldItem from '../../../components/WorldItem'
import Item from '../../../components/Item'
import QuestLanguageParser from '../parsers/QuestLanguageParser'

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

  public location: { x: number; y: number } | null = null
  public item: Item | null = null
  public worldItem: WorldItem | null = null

  public setup() {
    if (this.params.location.value) {
      const locationVal = QuestLanguageParser.interpretValue(
        this.params.location.value,
      )

      if (locationVal[0].type === 'var') {
        const questVar = this.quest.variables[locationVal[0].name]

        this.location = questVar.value
        console.log(this.location)
      }
    }
    if (this.params.item.value) {
      const itemVal = QuestLanguageParser.interpretValue(this.params.item.value)

      if (itemVal[0].type === 'var') {
        const questVar = this.quest.variables[itemVal[0].name]

        this.item = questVar.value
        console.log(this.item)
      }
    }
  }
}
