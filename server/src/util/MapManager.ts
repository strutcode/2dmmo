import MapLoader, { TileMap } from './MapLoader'

export default class MapManager {
  private static maps = new Map<string, TileMap>()

  public static getMap(name: string) {
    // Early out for cached maps
    if (this.maps.has(name)) {
      return this.maps.get(name)
    }

    // Load the map
    const map = MapLoader.load(name)

    // Update the cache
    this.maps.set(name, map)

    return map
  }

  public static getChunk(name: string, x: number, y: number) {
    const map = this.getMap(name)

    if (!map) return undefined

    const chunkX = Math.floor(x / map.chunkWidth) * 16
    const chunkY = Math.floor(y / map.chunkHeight) * 16

    return map.chunks[`${chunkX},${chunkY}`]
  }

  public static isPassable(name: string, x: number, y: number) {
    const chunk = this.getChunk(name, x, y)

    if (!chunk) return false

    const tileX = x - chunk.x
    const tileY = y - chunk.y

    return chunk.passable[tileY * 16 + tileX]
  }

  public static getPassableLocation(name: string) {
    const map = this.getMap(name)

    if (!map) return null

    let x, y

    for (let v = 0; v < map.height; v++) {
      for (let u = 0; u < map.width; u++) {
        if (this.isPassable(name, u, v)) {
          x = u
          y = v
        }
      }
    }

    if (x == null || y == null) {
      return null
    }

    return { x, y }
  }
}
