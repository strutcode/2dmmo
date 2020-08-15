export type TileData = { x: number; y: number; set: string }

export default class GameMap {
  private data: TileData[] = []

  constructor(public width = 10, public height = 10) {}

  public getTile(x: number, y: number): TileData | undefined {
    return this.data[x + y * this.width]
  }

  public setTile(x: number, y: number, tile: TileData) {
    this.data[x + y * this.width] = tile
  }
}
