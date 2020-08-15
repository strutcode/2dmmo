import EditorState from '../EditorState'
import tileSets from '../data/tilesets'

const tiles: Record<string, HTMLImageElement> = {}
Object.entries(tileSets).forEach(([name, url]) => {
  const img = new Image()

  img.src = url
  img.style.display = 'none'
  document.body.appendChild(img)

  tiles[name] = img
})

export default class WorldViewRenderer {
  private context: CanvasRenderingContext2D
  private boundDraw = this.draw.bind(this)
  private running = true

  private pan = {
    x: 0,
    y: 0,
  }
  private zoom = 1

  constructor(private canvas: HTMLCanvasElement, private state: EditorState) {
    const context = this.canvas.getContext('2d')

    if (!context) {
      throw `Couldn't initialize world view`
    }

    this.context = context
    this.resize()

    requestAnimationFrame(this.boundDraw)
  }

  public destroy() {
    this.running = false
  }

  public zoomIn() {
    this.zoom *= 1.1
  }

  public zoomOut() {
    this.zoom *= 0.9
  }

  public panBy(x: number, y: number) {
    this.pan.x += x
    this.pan.y += y
  }

  public pointToWorld(x: number, y: number): [number, number] {
    return [
      Math.floor((x - this.pan.x) / this.zoom / 16),
      Math.floor((y - this.pan.y) / this.zoom / 16),
    ]
  }

  private draw() {
    if (!this.running) return

    const ctx = this.context

    ctx.setTransform(this.zoom, 0, 0, this.zoom, this.pan.x, this.pan.y)
    ctx.clearRect(
      -this.pan.x / this.zoom,
      -this.pan.y / this.zoom,
      this.canvas.width / this.zoom,
      this.canvas.height / this.zoom,
    )
    ctx.imageSmoothingEnabled = false

    if (this.state.currentMap) {
      const map = this.state.currentMap

      let x, y
      for (y = 0; y < map.height; y++) {
        for (x = 0; x < map.width; x++) {
          const tile = map.getTile(x, y)

          if (tile) {
            ctx.drawImage(
              tiles[tile.set],
              tile.x * 16,
              tile.y * 16,
              16,
              16,
              x * 16,
              y * 16,
              16.1,
              16.1,
            )
          }
        }
      }
      ctx.fillStyle = ``

      ctx.strokeStyle = 'magenta'
      ctx.beginPath()
      ctx.rect(0, 0, map.width * 16, map.height * 16)
      ctx.stroke()
    }

    requestAnimationFrame(this.boundDraw)
  }

  private resize() {
    const bounds = this.canvas.getBoundingClientRect()

    this.canvas.width = bounds.width
    this.canvas.height = bounds.height
  }
}
