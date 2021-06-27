import System from '../../../common/engine/System'
import Input from '../components/Input'
import TilePosition from '../../../common/components/TilePosition'

/** This system controlls movement of all players */
export default class Movement extends System {
  public update() {
    // Update all player positions
    this.engine.forEachComponent(Input, (controller) => {
      controller.entity.with(TilePosition, (pos) => {
        const delta = {
          x: 0,
          y: 0,
        }

        // Apply all inputs
        controller.inputs.forEach((input, i) => {
          if (input.action === 'up') {
            delta.y--
          } else if (input.action === 'down') {
            delta.y++
          } else if (input.action === 'left') {
            delta.x--
          } else if (input.action === 'right') {
            delta.x++
          }

          // Remove the processed input from the queue
          controller.inputs.splice(i, 1)
        })

        // If the position actually changed, update it
        if (delta.x !== 0 || delta.y !== 0) {
          pos.x += delta.x
          pos.y += delta.y

          pos.y = Math.max(-13, Math.min(pos.y, 28))
          pos.x = Math.max(-13, Math.min(pos.x, 28))
        }
      })
    })
  }
}
