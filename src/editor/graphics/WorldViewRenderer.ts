import EditorState from '../EditorState'

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

    if (this.state.currentMap) {
      const { width, height } = this.state.currentMap

      ctx.strokeStyle = 'magenta'
      ctx.beginPath()
      ctx.rect(0, 0, width * 16, height * 16)
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
