import TilePosition from '../../../common/components/TilePosition'
import BaseEffect from '../BaseEffect'
import Input from '../components/Input'

export default class Charm extends BaseEffect {
  private waitTicks = 30

  public tick() {
    const input = this.entity?.getComponent(Input)
    const myPosition = this.entity?.getComponent(TilePosition)
    const targetPosition = this.source?.getComponent(TilePosition)

    // Remove the effect if it's inapplicable
    if (!input || !myPosition || !targetPosition) {
      this.destroy()
      return
    }

    // Override all input
    input.useQueue = []
    input.inputs = []

    if (this.waitTicks > 0) {
      this.waitTicks--
      return
    }

    // Calculate the difference between positions
    const deltaX = Math.abs(myPosition.x - targetPosition.x)
    const deltaY = Math.abs(myPosition.y - targetPosition.y)
    const distance = deltaX + deltaY

    // If it's more than 1 tile, move toward the target
    if (distance > 1) {
      let direction

      if (deltaX > deltaY) {
        direction = 'horizontal'
      } else if (deltaY > deltaX) {
        direction = 'vertical'
      } else {
        direction = Math.random() < 0.5 ? 'horizontal' : 'vertical'
      }

      if (direction === 'horizontal') {
        if (targetPosition.x < myPosition.x) {
          input.addInput('left')
        } else {
          input.addInput('right')
        }
      } else {
        if (targetPosition.y < myPosition.y) {
          input.addInput('up')
        } else {
          input.addInput('down')
        }
      }
    }

    this.waitTicks = 30
  }
}
