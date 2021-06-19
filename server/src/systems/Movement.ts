import System from '../../../common/engine/System'
import Input from '../components/Input'
import TilePosition from '../components/TilePosition'

export default class Movement extends System {
  public update() {
    this.engine.getAllComponents(TilePosition).forEach((pos) => {
      const controller = pos.entity.getComponent(Input)

      if (controller) {
        const delta = {
          x: 0,
          y: 0,
        }

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

          controller.inputs.splice(i, 1)
        })

        if (delta.x !== 0 || delta.y !== 0) {
          pos.x += delta.x
          pos.y += delta.y

          console.log(`Player ${pos.entity.id} move: ${pos.x}, ${pos.y}`)
        }
      }
    })
  }
}
