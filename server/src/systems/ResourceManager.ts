import TilePosition from '../../../common/components/TilePosition'
import System from '../../../common/engine/System'
import Player from '../components/Player'
import WorldItem from '../components/WorldItem'
import Item from '../Item'
import FetchItem from './quest/objectives/FetchItem'

export default class ResourceManager extends System {
  public update() {
    // Update quests
    this.engine.forEachComponent(Player, (player) => {
      player.quests.forEach((quest) => {
        Object.values(quest.variables).forEach((variable) => {
          if (variable.value == null && variable.type === 'prop') {
            variable.value = new Item('Doodad')
          }
        })

        // HACK: spawn item for fetch objective
        const objective = quest.currentObjective

        if (objective instanceof FetchItem) {
          if (objective.item && objective.location && !objective.worldItem) {
            const entity = this.engine.createEntity({
              components: [
                [WorldItem, { item: objective.item }],
                [TilePosition, objective.location],
              ],
            })

            entity.with(WorldItem, (worldItem) => {
              objective.worldItem = worldItem
            })
          }
        }
      })
    })
  }
}
