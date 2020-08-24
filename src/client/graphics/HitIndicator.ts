import Mobile from '../entities/Mobile'
import Observable from '../../common/Observable'

export default class HitIndicator {
  public x = this.target.x * 16 + 8
  public y = this.target.y * 16 + 8
  public onDie = new Observable()

  private direction: number
  private velocity = {
    x: 1.5,
    y: 1,
  }
  private lifetime = 1.2

  constructor(
    private source: Mobile,
    private target: Mobile,
    public amount: number,
  ) {
    if (source.x < target.x) {
      this.direction = 1
    } else if (source.x > target.x) {
      this.direction = -1
    } else {
      this.direction = Math.sign(Math.random() - 0.5) || 1
    }
  }

  public draw(ctx: CanvasRenderingContext2D, delta: number) {
    const alpha = Math.min(1, this.lifetime * 5)
    ctx.fillStyle = alpha < 1 ? `rgba(255, 0, 0, ${alpha})` : 'red'
    ctx.strokeStyle = alpha < 1 ? `rgba(0, 0, 0, ${alpha})` : 'black'
    ctx.lineWidth = 1
    ctx.textAlign = 'center'
    ctx.textBaseline = 'bottom'
    ctx.font = `bold 3pt Palantino`
    ctx.imageSmoothingEnabled = true

    ctx.strokeText(this.text.toUpperCase(), this.x, this.y, 1000)
    ctx.fillText(this.text.toUpperCase(), this.x, this.y, 1000)

    this.x += this.velocity.x * this.direction
    this.y -= this.velocity.y

    this.velocity.x -= 10 * delta
    this.velocity.y -= 10 * delta

    if (this.velocity.x < 0) this.velocity.x = 0
    if (this.velocity.y < 0) this.velocity.y = 0

    this.lifetime -= delta
    if (this.lifetime <= 0) {
      this.onDie.notify()
    }
  }

  public get text() {
    return String(this.amount)
  }
}
