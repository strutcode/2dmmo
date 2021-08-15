import TilePosition from '../../../common/components/TilePosition'
import System from '../../../common/engine/System'
import Player from '../components/Player'
import WorldItem from '../components/WorldItem'
import Item from '../components/Item'
import FetchItem from './quest/objectives/FetchItem'

export default class ResourceManager extends System {
  public update() {
    // Update quests
    this.engine.forEachComponent(Player, (player) => {
      player.quests.forEach((quest) => {
        Object.values(quest.variables).forEach((variable) => {
          if (variable.value == null && variable.type === 'prop') {
            const entity = this.engine.createEntity({
              components: [[Item, { name: 'Doodad' }]],
            })

            variable.value = entity.getComponent(Item)
          }
        })
      })
    })

    this.engine.forEachComponent(Item, (item) => {
      if (item.desiredLocation) {
        if (item.desiredLocation.type === 'world') {
          if (typeof item.desiredLocation.target === 'object') {
            this.engine.attachComponents(item.entity, [
              [TilePosition, item.desiredLocation.target],
            ])
          }
        }

        item.desiredLocation = undefined
      }
    })
  }
}
