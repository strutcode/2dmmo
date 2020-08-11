import GameState from '../GameState'
import spritemap from './spritemap'
import Camera from './Camera'

export default class Renderer {
  private canvas = document.createElement('canvas')
  private context: CanvasRenderingContext2D

  private boundDraw = this.draw.bind(this)
  private boundResize = this.resize.bind(this)
  private run = true
  private width = 16 * 25
  private height = 16 * 25
  private lastTime = performance.now()

  private assets: Record<string, HTMLImageElement> = {}
  private frameCounter = new Map<string, number>()
  private camera = new Camera()

  public constructor(private state: GameState) {
    const context = this.canvas.getContext('2d')

    if (!context) {
      throw `Couldn't initialize renderer`
    }

    this.context = context
  }

  public start() {
    console.log('start renderer')
    document.body.appendChild(this.canvas)

    this.canvas.width = this.width
    this.canvas.height = this.height

    this.resize()
    window.addEventListener('resize', this.boundResize)

    requestAnimationFrame(this.boundDraw)
  }

  public stop() {
    console.log('stop renderer')
    this.run = false
    window.removeEventListener('resize', this.boundResize)
    this.canvas.remove()
  }

  private resize() {
    if (window.innerWidth > window.innerHeight) {
      this.canvas.style.width = '100%'
      this.canvas.style.height = 'auto'
    } else {
      this.canvas.style.width = 'auto'
      this.canvas.style.height = '100%'
    }
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
    this.assets.creaturesRampart = await loadImage(
      require('../../../assets/HAS Creature Pack/Rampart/Rampact(AllFrame).png')
        .default,
    )
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

  private drawSprite(
    name: string,
    action: string,
    frame: number,
    x: number,
    y: number,
  ) {
    if (!(spritemap as any)[name][action]) {
      this.context.fillStyle = 'magenta'
      this.context.fillRect(x * 16, y * 16, 16, 16)
      return
    }

    const { row, frames } = (spritemap as any)[name][action]
    this.drawTile(
      spritemap[name as keyof typeof spritemap]._asset,
      Math.floor(frame % frames),
      row,
      x,
      y,
    )
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
      this.camera.set(this.state.self.x, this.state.self.y)
    }

    this.state.mobs.forEach((player) => {
      const { id, x, y, sprite, action } = player
      const frame = this.frameCounter.get(id) || Math.random()

      this.frameCounter.set(id, frame + delta * 4)

      this.drawSprite(
        sprite,
        action,
        frame,
        x - this.camera.x + 12,
        y - this.camera.y + 12,
      )
      // this.drawText(name, x * 16 + 8, y * 16 + 16)
    })

    this.lastTime += delta * 1000
    requestAnimationFrame(this.boundDraw)
  }
}
