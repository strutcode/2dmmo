import EditorState from '../EditorState'
import tileSets from '../../common/data/tilesets'

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
  private lastDraw = performance.now()

  private pan = {
    x: 0,
    y: 0,
  }
  private zoom = 3

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

  public setZoom(value: number) {
    this.zoom = value
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

  public panTo(x: number, y: number) {
    this.pan.x = x
    this.pan.y = y
  }

  public pointToWorld(x: number, y: number): [number, number] {
    return [
      Math.floor((x - this.pan.x) / this.zoom / 16),
      Math.floor((y - this.pan.y) / this.zoom / 16),
    ]
  }

  private draw() {
    if (!this.running) return

    const bounds = this.canvas.getBoundingClientRect()
    if (
      Math.floor(bounds.width) !== this.canvas.width ||
      Math.floor(bounds.height) !== this.canvas.height
    ) {
      this.canvas.width = bounds.width
      this.canvas.height = bounds.height
    }

    const ctx = this.context
    const start = performance.now()
    const delta = (start - this.lastDraw) / 1000

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

      let x, y, l
      for (l = map.layers.length - 1; l >= 0; l--) {
        for (y = 0; y < map.height; y++) {
          for (x = 0; x < map.width; x++) {
            const tile = map.getTile(x, y, l)

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
      }

      if (this.state.selection && this.state.floatingSelection) {
        const data = this.state.floatingSelection

        let u, v
        for (v = 0; v < data.length; v++) {
          if (!data[v]) continue

          for (u = 0; u < data[v].length; u++) {
            const tile = data[v][u]

            if (tile) {
              ctx.drawImage(
                tiles[tile.set],
                tile.x * 16,
                tile.y * 16,
                16,
                16,
                (this.state.selection.x + u) * 16,
                (this.state.selection.y + v) * 16,
                16.1,
                16.1,
              )
            }
          }
        }
      }

      ctx.strokeStyle = 'magenta'
      ctx.setLineDash([])
      ctx.beginPath()
      ctx.rect(0, 0, map.width * 16, map.height * 16)
      ctx.stroke()

      if (this.state.selection) {
        const { x, y, w, h } = this.state.selection

        ctx.strokeStyle = 'black'
        ctx.setLineDash([4, 4])
        ctx.lineDashOffset += delta * 8
        ctx.beginPath()
        ctx.rect(x * 16, y * 16 + 1, w * 16, h * 16)
        ctx.stroke()

        ctx.strokeStyle = 'white'
        ctx.beginPath()
        ctx.rect(x * 16, y * 16, w * 16, h * 16)
        ctx.stroke()
      }
    }

    this.lastDraw = start
    requestAnimationFrame(this.boundDraw)
  }

  private resize() {
    const bounds = this.canvas.getBoundingClientRect()

    this.canvas.width = bounds.width
    this.canvas.height = bounds.height
  }
}
