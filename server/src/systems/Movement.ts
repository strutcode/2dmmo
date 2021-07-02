import System from '../../../common/engine/System'
import Input from '../components/Input'
import TilePosition from '../../../common/components/TilePosition'
import MapManager from '../util/MapManager'

/** This system controlls movement of all players */
export default class Movement extends System {
  public update() {
    // Update all player positions
    this.engine.forEachComponent(Input, (controller) => {
      controller.entity.with(TilePosition, (pos) => {
        // Apply all inputs
        controller.inputs.forEach((input, i) => {
          if (input.action === 'up') {
            this.move(pos, 0, -1)
          } else if (input.action === 'down') {
            this.move(pos, 0, 1)
          } else if (input.action === 'left') {
            this.move(pos, -1, 0)
          } else if (input.action === 'right') {
            this.move(pos, 1, 0)
          }

          // Remove the processed input from the queue
          controller.inputs.splice(i, 1)
        })
      })
    })
  }

  protected move(pos: TilePosition, deltaX: number, deltaY: number) {
    if (MapManager.isPassable(pos.map, pos.x + deltaX, pos.y + deltaY)) {
      pos.x += deltaX
      pos.y += deltaY
    } else {
      // HACK: Ensure the position gets updated
      pos.x = pos.x
    }
  }
}
