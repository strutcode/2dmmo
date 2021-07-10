import System from '../../../common/engine/System'
import Player from '../components/Player'

export default class ResourceManager extends System {
  public update() {
    // Update quests
    this.engine.forEachComponent(Player, (player) => {
      player.quests.forEach((quest) => {
        Object.values(quest.variables).forEach((variable) => {
          if (variable.value == null && variable.type === 'prop') {
            // Generate item
          }
        })
      })
    })
  }
}
