import TilePosition from '../../../common/components/TilePosition'
import BaseEffect from '../BaseEffect'
import Input from '../components/Input'

export default class Charm extends BaseEffect {
  private waitTicks = 30

  public tick() {
    const input = this.entity?.getComponent(Input)
    const posA = this.entity?.getComponent(TilePosition)
    const posB = this.source?.getComponent(TilePosition)

    // Remove the effect if it's inapplicable
    if (!input || !posA || !posB) {
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
    const deltaX = Math.abs(posA.x - posB.x)
    const deltaY = Math.abs(posA.y - posB.y)
    const distance = deltaX + deltaY

    // If it's more than 1 tile, move toward the target
    if (distance > 1) {
      if (deltaX > deltaY) {
        if (posB.x < posA.x) {
          input.addInput('left')
        } else {
          input.addInput('right')
        }
      } else {
        if (posB.y < posA.y) {
          input.addInput('up')
        } else {
          input.addInput('down')
        }
      }
    }

    this.waitTicks = 30
  }
}
