import Mobile from '../entities/Mobile'

export default class NameTag {
  public constructor(public mob: Mobile, public x = 0, public y = 0) {}

  public draw(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = this.mob.sprite === 'player' ? '#00fdff' : 'white'
    ctx.strokeStyle = 'black'
    ctx.lineWidth = 1
    ctx.textAlign = 'center'
    ctx.textBaseline = 'bottom'
    ctx.font = `3pt Palantino`
    ctx.imageSmoothingEnabled = true

    ctx.strokeText(this.mob.name.toUpperCase(), this.x + 8, this.y, 1000)
    ctx.fillText(this.mob.name.toUpperCase(), this.x + 8, this.y, 1000)
  }
}
