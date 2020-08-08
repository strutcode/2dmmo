import GameState from '../GameState'

export default class Renderer {
  private canvas = document.createElement('canvas')
  private context: CanvasRenderingContext2D

  private boundDraw = this.draw.bind(this)
  private run = true

  private assets: Record<string, HTMLImageElement> = {}

  public constructor(private state: GameState) {
    const context = this.canvas.getContext('2d')

    if (!context) {
      throw `Couldn't initialize renderer`
    }

    this.context = context
    document.body.appendChild(this.canvas)

    this.canvas.width = 640
    this.canvas.height = 320
  }

  public start() {
    console.log('start renderer')

    requestAnimationFrame(this.boundDraw)
  }

  public async load() {
    const loadImage = async (src: string): Promise<HTMLImageElement> =>
      new Promise((resolve, reject) => {
        const img = new Image()
        img.src = src
        img.onload = () => resolve(img)
        img.onerror = (e) => reject(e)
      })

    this.assets.grassTiles = await loadImage(
      require('../../../assets/HAS Overworld 2.0/GrassBiome/GB-LandTileset.png')
        .default,
    )
  }

  public stop() {
    console.log('stop renderer')
    this.run = false
    document.body.removeChild(this.canvas)
  }

  public draw() {
    if (!this.run) return

    let x, y
    for (y = 0; y < 20; y++) {
      for (x = 0; x < 40; x++) {
        this.context.drawImage(
          this.assets.grassTiles,
          16,
          16,
          16,
          16,
          x * 16,
          y * 16,
          16,
          16,
        )
      }
    }

    this.context.fillStyle = 'red'
    this.context.fillRect(Math.random() * 630, Math.random() * 350, 10, 10)

    requestAnimationFrame(this.boundDraw)
  }
}
