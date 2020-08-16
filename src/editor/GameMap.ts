export type TileData = { x: number; y: number; set: string }
export type TileLayer = { name: string; data: TileData[][] }

export default class GameMap {
  public layers: TileLayer[] = [{ name: 'default', data: [] }]
  private l = 0

  constructor(public width = 10, public height = 10) {}

  public getTile(x: number, y: number): TileData | undefined {
    const l = this.l

    if (!this.layers[l]?.data || !this.layers[l].data[y]) {
      return undefined
    }

    return this.layers[l].data[y][x]
  }

  public setTile(x: number, y: number, tile: TileData) {
    if (x < 0 || y < 0 || x >= this.width || y >= this.height) {
      return
    }

    const l = this.l

    if (!this.layers[l].data[y]) {
      this.layers[l].data[y] = []
    }

    this.layers[l].data[y][x] = tile
  }

  public getTiles(
    x: number,
    y: number,
    w: number,
    h: number,
  ): (TileData | undefined)[][] {
    const result = []

    let u, v
    for (v = 0; v < h; v++) {
      result[v] = [] as (TileData | undefined)[]

      for (u = 0; u < w; u++) {
        result[v][u] = this.getTile(x + u, y + v)
      }
    }

    return result
  }

  public setTiles(x: number, y: number, data: (TileData | undefined)[][]) {
    data.forEach((row, v) => {
      row.forEach((col, u) => {
        if (col != null) {
          this.setTile(x + u, y + v, col)
        }
      })
    })
  }

  public clearTiles(x: number, y: number, w: number, h: number) {
    const l = this.l

    if (!this.layers[l].data) return

    let u, v
    for (v = y; v < y + h; v++) {
      if (!this.layers[l].data[v]) continue

      for (u = x; u < x + w; u++) {
        delete this.layers[l].data[v][u]
      }
    }
  }
}
