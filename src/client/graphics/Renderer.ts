import GameState from '../GameState'

export default class Renderer {
  private canvas = document.createElement('canvas')
  private context: CanvasRenderingContext2D

  private boundDraw = this.draw.bind(this)
  private run = true
  private width = 16 * 25
  private height = 16 * 13
  private lastTime = performance.now()

  private assets: Record<string, HTMLImageElement> = {}
  private animState: Record<string, number> = {}

  public constructor(private state: GameState) {
    const context = this.canvas.getContext('2d')

    if (!context) {
      throw `Couldn't initialize renderer`
    }

    this.context = context
    document.body.appendChild(this.canvas)

    this.canvas.width = this.width
    this.canvas.height = this.height
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
    this.assets.creaturesCastle = await loadImage(
      require('../../../assets/HAS Creature Pack/Castle/Castle(AllFrame).png')
        .default,
    )
  }

  public stop() {
    console.log('stop renderer')
    this.run = false
    document.body.removeChild(this.canvas)
  }

  private drawTile(type: string, sx: number, sy: number, x: number, y: number) {
    if (!this.assets[type]) {
      this.context.fillStyle = 'magenta'
      this.context.fillRect(x * 16, y * 16, 16, 16)
      return
    }

    this.context.drawImage(
      this.assets[type],
      sx * 16,
      sy * 16,
      16,
      16,
      x * 16,
      y * 16,
      16,
      16,
    )
  }

  private drawText(
    text: string,
    x: number,
    y: number,
    hAlign: CanvasTextAlign = 'center',
    vAlign: CanvasTextBaseline = 'top',
  ) {
    this.context.font = '14px "Courier New"'
    this.context.textAlign = hAlign
    this.context.textBaseline = vAlign
    this.context.fillStyle = 'white'
    this.context.strokeStyle = 'black'
    this.context.strokeText(text, x, y)
    this.context.fillText(text, x, y)
  }

  public draw(time: number) {
    const delta = (time - this.lastTime) / 1000

    if (!this.run) return

    this.context.fillStyle = 'black'
    this.context.fillRect(0, 0, this.width, this.height)

    let x, y
    for (y = 0; y < this.height / 16; y++) {
      for (x = 0; x < this.width / 16; x++) {
        this.drawTile('grassTiles', 1, 1, x, y)
      }
    }

    if (this.state.self) {
      const { name, x, y } = this.state.self

      const frame = ((this.animState[name] || 0) + delta * 4) % 4
      this.animState[name] = frame

      this.drawTile('creaturesCastle', Math.floor(frame), 15, x, y)
      this.drawText('You', x * 16 + 8, y * 16 + 16)
    }

    this.state.players.forEach((player) => {
      const { name, x, y } = player

      const frame = ((this.animState[name] || 0) + delta * 4) % 4
      this.animState[name] = frame

      this.drawTile('creaturesCastle', Math.floor(frame), 15, x, y)
      this.drawText(name, x * 16 + 8, y * 16 + 16)
    })

    this.lastTime += delta * 1000
    requestAnimationFrame(this.boundDraw)
  }
}
