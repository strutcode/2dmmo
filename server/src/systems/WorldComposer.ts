import System from '../../../common/engine/System';
import TilePosition from '../components/TilePosition';
import TileVisibility from '../components/TileVisibility';
import MapLoader, { TileMap } from '../util/MapLoader';



export default class WorldComposer extends System {
  private loadedMaps = new Map<string, TileMap>()

  public update() {
    this.engine.getAllComponents(TilePosition).forEach(pos => {
      const visibility = pos.entity.getComponent(TileVisibility)

      // Nothing to do here if the entity can't actually see tiles
      if (!visibility) {
        return
      }

      // Make sure we have the data
      if (!this.loadedMaps.has(pos.map)) {
        console.log(`Load map ${pos.map}`)
        const map = MapLoader.load(pos.map)
        this.loadedMaps.set(pos.map, map)
      }

      // Setup
      const map = this.loadedMaps.get(pos.map) as TileMap
      const chunkX = Math.floor(pos.x / map.chunkWidth)
      const chunkY = Math.floor(pos.y / map.chunkHeight)
      const chunk = map.chunks[`${chunkX},${chunkY}`]

      // Handle tile visibility
      if (chunk) {
        visibility.revealChunk(chunkX, chunkY, chunk.layers)
      }
    })
  }
}