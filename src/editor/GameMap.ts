export type TileData = { x: number; y: number; set: string; walkable: boolean }
export type TileLayer = { name: string; data: TileData[][] }
export type SerializedMap = {
  name: string
  width: number
  height: number
  layers: TileLayer[]
}

export default class GameMap {
  public layers: TileLayer[] = [{ name: 'Untitled Layer', data: [] }]
  private l = 0

  public constructor(
    public name: string,
    public width = 10,
    public height = 10,
  ) {}

  public selectLayer(index: number) {
    if (this.layers[index]) {
      this.l = index
    }
  }

  public addLayer(name?: string) {
    this.layers.unshift({
      name: name || `Untitled Layer`,
      data: [],
    })
  }

  public getTile(
    x: number,
    y: number,
    l: number = this.l,
  ): TileData | undefined {
    if (!this.layers[l]?.data || !this.layers[l].data[y]) {
      return undefined
    }

    return this.layers[l].data[y][x]
  }

  public setTile(
    x: number,
    y: number,
    tile: TileData | undefined,
    l: number = this.l,
  ) {
    if (!this.layers[l]) return

    if (x < 0 || y < 0 || x >= this.width || y >= this.height) {
      return
    }

    if (!this.layers[l].data[y]) {
      this.layers[l].data[y] = []
    }

    if (tile) {
      this.layers[l].data[y][x] = tile
    } else {
      delete this.layers[l].data[y][x]
    }
  }

  public setWalkable(
    x: number,
    y: number,
    walkable: boolean,
    l: number = this.l,
  ) {
    const tile = this.getTile(x, y, l)
    console.log('walkable', tile)

    if (tile) {
      tile.walkable = walkable
    }
  }

  public getTiles(
    x: number,
    y: number,
    w: number,
    h: number,
    l: number = this.l,
  ): (TileData | undefined)[][] {
    const result = []

    let u, v
    for (v = 0; v < h; v++) {
      result[v] = [] as (TileData | undefined)[]

      for (u = 0; u < w; u++) {
        result[v][u] = this.getTile(x + u, y + v, l)
      }
    }

    return result
  }

  public setTiles(
    x: number,
    y: number,
    data: (TileData | undefined)[][],
    l: number = this.l,
  ) {
    data.forEach((row, v) => {
      row.forEach((col, u) => {
        if (col != null) {
          this.setTile(x + u, y + v, col, l)
        }
      })
    })
  }

  public clearTiles(
    x: number,
    y: number,
    w: number,
    h: number,
    l: number = this.l,
  ) {
    if (!this.layers[l].data) return

    let u, v
    for (v = y; v < y + h; v++) {
      if (!this.layers[l].data[v]) continue

      for (u = x; u < x + w; u++) {
        delete this.layers[l].data[v][u]
      }
    }
  }

  public resize(width: number, height: number) {
    let x, y

    this.layers = this.layers.map(oldLayer => {
      const newLayer: TileLayer = { name: oldLayer.name, data: [] }

      for (y = 0; y < height; y++) {
        newLayer.data[y] = []
        if (!oldLayer.data[y]) continue

        for (x = 0; x < width; x++) {
          newLayer.data[y][x] = oldLayer.data[y][x]
        }
      }

      return newLayer
    })
    this.width = width
    this.height = height
  }

  public serialize(): SerializedMap {
    const { name, width, height, layers } = this

    return { name, width, height, layers }
  }

  public deserialize(data: SerializedMap) {
    Object.assign(this, data)
  }
}
