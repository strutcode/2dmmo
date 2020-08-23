import enemies from '../../common/data/enemies'

export default class Sprite {
  private image: HTMLImageElement
  private imageReady = false
  private pos = [0, 0]

  public constructor(private data: Record<string, any>) {
    log.out('Sprite', `Load image: ${data.set} (${enemies[data.set]})`)
    this.image = document.createElement('img')
    this.image.src = enemies[data.set]
    this.image.onload = () => {
      this.imageReady = true
    }
  }

  public get x() {
    return Math.floor(this.pos[0] / 16)
  }
  public set x(val) {
    this.pos[0] = val * 16
  }

  public get y() {
    return Math.floor(this.pos[1] / 16)
  }
  public set y(val) {
    this.pos[1] = val * 16
  }

  public draw(context: CanvasRenderingContext2D) {
    if (!this.imageReady) {
      context.fillStyle = 'magenta'
      context.fillRect(this.pos[0], this.pos[1], 16, 16)
    }

    context.imageSmoothingEnabled = false
    context.drawImage(
      this.image,
      this.data.x * 16,
      this.data.y * 16,
      16,
      16,
      this.pos[0],
      this.pos[1],
      16,
      16,
    )
  }
}
