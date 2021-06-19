import System from '../../../common/engine/System'
import TilePosition from '../components/TilePosition'

export default class Movement extends System {
  public update() {
    this.engine.getAllComponents(TilePosition).forEach((pos) => {
      const delta = pos.moveIntentX + (pos.moveIntentY << 32)

      pos.x += pos.moveIntentX
      pos.y += pos.moveIntentY
      pos.moveIntentX = 0
      pos.moveIntentY = 0

      if (delta !== 0) {
        console.log(`Player ${pos.entity.id} move: ${pos.x}, ${pos.y}`)
      }
    })
  }
}
