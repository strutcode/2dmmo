export default class NameTag {
  public constructor(public text: string, public x = 0, public y = 0) {}

  public draw(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = 'white'
    ctx.strokeStyle = 'black'
    ctx.lineWidth = 1
    ctx.textAlign = 'center'
    ctx.textBaseline = 'bottom'
    ctx.font = `bold 3pt Palantino`
    ctx.imageSmoothingEnabled = true
    ctx.canvas.style.letterSpacing = '10px'

    ctx.strokeText(this.text.toUpperCase(), this.x + 8, this.y, 1000)
    ctx.fillText(this.text.toUpperCase(), this.x + 8, this.y, 1000)
  }
}
