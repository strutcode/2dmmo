export type TileData = { x: number; y: number; set: string }

export default class GameMap {
  private data: TileData[][] = []

  constructor(public width = 10, public height = 10) {}

  public getTile(x: number, y: number): TileData | undefined {
    if (!this.data[y]) {
      return undefined
    }

    return this.data[y][x]
  }

  public setTile(x: number, y: number, tile: TileData) {
    if (x < 0 || y < 0 || x >= this.width || y >= this.height) {
      return
    }

    if (!this.data[y]) {
      this.data[y] = Array(this.width)
    }

    this.data[y][x] = tile
  }
}
