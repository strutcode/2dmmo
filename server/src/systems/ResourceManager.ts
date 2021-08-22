import TilePosition from '../../../common/components/TilePosition'
import System from '../../../common/engine/System'
import Player from '../components/Player'
import Item from '../components/Item'
import Input from '../components/Input'

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

    // No better place to put this for now
    this.engine.forEachComponent(Input, (controller) => {
      controller.entity.with(TilePosition, (mobPos) => {
        controller.inputs.forEach((input, i) => {
          if (input.action === 'get-item') {
            console.log('get item')
            this.engine.forEachComponent(Item, (item) => {
              item.entity.with(TilePosition, (itemPos) => {
                if (itemPos.x === mobPos.x && itemPos.y === mobPos.y) {
                  console.log('item retrieved')
                  item.desiredLocation = {
                    type: 'mobile',
                    target: controller.entity.id,
                  }
                }
              })
            })

            controller.inputs.splice(i, 1)
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
        } else if (item.desiredLocation.type === 'mobile') {
          if (typeof item.desiredLocation.target === 'number') {
            this.engine.destroyEntity(item.entity)
          }
        }

        item.desiredLocation = undefined
      }
    })
  }
}
