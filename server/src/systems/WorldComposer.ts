import System from '../../../common/engine/System'
import TilePosition from '../../../common/components/TilePosition'
import TileVisibility from '../components/TileVisibility'
import MapLoader, { TileMap } from '../util/MapLoader'
import MapManager from '../util/MapManager'

export default class WorldComposer extends System {
  private loadedMaps = new Map<string, TileMap>()

  public update() {
    this.engine.forEachComponent(TilePosition, (pos) => {
      pos.entity.with(TileVisibility, (visibility) => {
        const map = MapManager.getMap(pos.map)

        if (!map) {
          return;
        }

        /** Provides the closest lower increment of `increment` to `n` */
        const gridSnap = (n: number, increment: number) =>
          Math.floor(n / increment) * increment

        // Find the area which the TileVisibility can see
        const bounds = {
          minX: gridSnap(pos.x - visibility.range, map.chunkWidth),
          maxX: gridSnap(pos.x + visibility.range, map.chunkWidth),
          minY: gridSnap(pos.y - visibility.range, map.chunkHeight),
          maxY: gridSnap(pos.y + visibility.range, map.chunkHeight),
        }

        // For each chunk which overlaps that area...
        for (let y = bounds.minY; y <= bounds.maxY; y += map.chunkHeight) {
          for (let x = bounds.minX; x <= bounds.maxX; x += map.chunkWidth) {
            // Mark it as revealed if it exists in the map
            const chunk = map.chunks[`${x},${y}`]

            if (chunk) {
              visibility.revealChunk(x, y, chunk.layers, chunk.passable)
            }
          }
        }
      })
    })
  }
}
