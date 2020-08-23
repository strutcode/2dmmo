import tileSets from '../../common/data/tilesets'

interface TileData {
  set: string
  x: number
  y: number
}

export default class TileMap {
  private data: TileData[][][] = []
  private width = 0
  private height = 0
  private images: Record<string, HTMLImageElement> = {}
  private canvas = document.createElement('canvas')

  private loadImage(name: string) {
    const img = new Image()
    img.src = tileSets[name]
    this.images[name] = img
    this.images[name].onload = () => {
      this.images[name].dataset.loaded = ''
      this.renderMap()
    }
  }

  public loadTiles(data: any[]) {
    log.out('Tilemap', 'Load tiles')
    data.forEach(tile => {
      const { layer, set, sx, sy, dx, dy } = tile

      if (!this.data[dy]) this.data[dy] = []
      if (!this.data[dy][dx]) this.data[dy][dx] = []

      if (dx > this.width) this.width = dx
      if (dy > this.height) this.height = dy

      if (!this.images[set]) this.loadImage(set)

      this.data[dy][dx][layer] = { set, x: sx, y: sy }
    })

    this.renderMap()
  }

  public draw(context: CanvasRenderingContext2D) {
    context.imageSmoothingEnabled = false
    context.drawImage(this.canvas, 0, 0)
  }

  private renderMap() {
    log.out(
      'Tilemap',
      `Render map: ${this.width}x${this.height} (${this.data.length})`,
    )
    this.canvas.width = this.width * 16
    this.canvas.height = this.height * 16

    const ctx = this.canvas.getContext('2d')
    if (!ctx) return

    let x: number, y: number
    for (y = 0; y < this.height; y++) {
      if (!this.data[y]) continue

      for (x = 0; x < this.width; x++) {
        const tiles = this.data[y][x]

        tiles.forEach(tile => {
          if (!this.images[tile.set].dataset.loaded) {
            ctx.fillStyle = 'magenta'
            ctx.fillRect(x * 16, y * 16, 16, 16)
          }

          ctx.drawImage(
            this.images[tile.set],
            tile.x * 16,
            tile.y * 16,
            16,
            16,
            x * 16,
            y * 16,
            16,
            16,
          )
        })
      }
    }
  }
}
