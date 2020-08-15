export default class WorldViewRenderer {
  private context: CanvasRenderingContext2D
  private boundDraw = this.draw.bind(this)
  private running = true

  constructor(private canvas: HTMLCanvasElement) {
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

  private draw() {
    if (!this.running) return

    const ctx = this.context
    const { width, height } = this.canvas

    ctx.strokeStyle = 'green'
    ctx.beginPath()
    ctx.rect(
      Math.random() * width,
      Math.random() * height,
      Math.random() * width,
      Math.random() * height,
    )
    ctx.stroke()

    requestAnimationFrame(this.boundDraw)
  }

  private resize() {
    const bounds = this.canvas.getBoundingClientRect()

    this.canvas.width = bounds.width
    this.canvas.height = bounds.height
  }
}
