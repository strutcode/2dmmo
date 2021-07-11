import { readFileSync, writeFileSync } from 'fs'
import { performance } from 'perf_hooks'

type TiledMap = {
  width: number
  height: number
  tilewidth: number
  tileheight: number
  orientation: string
  renderorder: string
  infinite: boolean
  properties: TiledProperty[]
  tilesets: TiledTileset[]
  layers: TiledLayer[]
}

type TiledProperty = {
  name: string
  type: 'string' | 'int' | 'bool' | 'float' | 'file' | 'color' | 'object'
  value: any
}

type TiledTileset = {
  columns: number
  firstgid: number
  image: string
  imageheight: number
  imagewidth: number
  margin: number
  name: string
  spacing: number
  tilecount: number
  tileheight: number
  tilewidth: number
  tiles: TiledTile[]
}

type TiledTile = {
  id: number
  properties: TiledProperty[]
}

type TiledLayer = {
  id: number
  name: string
  type: string
  x: number
  y: number
  width: number
  height: number
  chunks: TiledChunk[]
  opacity: number
  startx: number
  starty: number
  visible: boolean
}

type TiledChunk = {
  x: number
  y: number
  width: number
  height: number
  data: number[]
}

export type TileMap = {
  width: number
  height: number
  spawnX: number
  spawnY: number
  chunkWidth: number
  chunkHeight: number
  chunks: Record<string, TileMapChunk>
}

export type TileMapChunk = {
  x: number
  y: number
  layers: number[][]
  passable: boolean[]
}

type TileProperties = {
  passable: boolean
}

export default class MapLoader {
  public static load(name: string): TileMap {
    const start = performance.now()

    // Get the raw text
    const content = readFileSync(`./data/maps/${name}.json`, {
      encoding: 'utf8',
    })

    // Parse it
    // TODO: error handling
    const data = JSON.parse(content) as TiledMap

    // Figure out chunk size
    // TODO: make this not a hack
    const chunkWidth = data.layers[0].chunks[0].width
    const chunkHeight = data.layers[0].chunks[0].height

    /** Gets a custom property from the map data */
    const getProperty = (
      type: TiledProperty['type'],
      name: string,
      defaultValue: any = null,
    ) => {
      const prop = data.properties.find((prop) => prop.name === name)

      if (!prop || prop.type !== type) {
        return defaultValue
      }

      return prop.value
    }

    /** Loads metadata for tiles */
    const tileProperties: TileProperties[] = []
    const loadTileData = () => {
      data.tilesets.forEach((tileset) => {
        // Default all tiles to passable
        for (
          let i = tileset.firstgid;
          i < tileset.firstgid + tileset.tilecount;
          i++
        ) {
          tileProperties[i] ??= {
            passable: true,
          }
        }

        // Check each definition in this tileset
        tileset.tiles.forEach((tile) => {
          const impassable = tile.properties.find(
            (prop) => prop.name === 'impassable',
          )

          // If the "impassable" property is truthy, update it
          if (impassable?.value) {
            tileProperties[tileset.firstgid + tile.id].passable = false
          }
        })
      })
    }

    /** Loads tile data into the game's format */
    const loadChunkMap = () => {
      // Prepare the final map
      const map: Record<string, TileMapChunk> = {}

      // For each layer
      data.layers.forEach((layer, layerIndex) => {
        // Iterate all the chunks in this layer, which may be anywhere in the world
        layer.chunks.forEach((chunk) => {
          const key = `${chunk.x},${chunk.y}`

          // Initialize this chunk if there isn't any data
          map[key] ??= {
            x: chunk.x,
            y: chunk.y,
            layers: [],
            passable: Array(chunk.data.length).fill(true),
          }

          // Convert from 1-based to 0-based
          const tileData = chunk.data.map((index) => index - 1)

          // Assign the data to this specific layer
          map[key].layers[layerIndex] = tileData

          // Set passable status
          map[key].passable = chunk.data.map((tileId, i) => {
            // Ignore empty tiles (e.g. air in upper layers)
            if (tileId === 0) return map[key].passable[i]

            // Only allow passage if all layers are passable
            return map[key].passable[i] && tileProperties[tileId]?.passable
          })
        })
      })

      return map
    }

    // Load tile metadata
    loadTileData()

    // Build the final map object
    const map = {
      width: data.width,
      height: data.height,
      spawnX: getProperty('int', 'spawnX', 0),
      spawnY: getProperty('int', 'spawnY', 0),
      chunkWidth,
      chunkHeight,
      chunks: loadChunkMap(),
    }

    // Record performance
    const end = performance.now()
    console.log(`Loaded map "${name}" in ${Math.round(end - start)}ms`)

    return map
  }
}
