import Camera from './Camera'
import GameState from '../GameState'
import spritemap from './spritemap'
import Mobile from '../entities/Mobile'

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
  private lastAction = new Map<string, string>()
  private camera = new Camera()

  public constructor(private state: GameState) {
    const context = this.canvas.getContext('2d')

    if (!context) {
      throw `Couldn't initialize renderer`
    }

    this.context = context
  }

  public start() {
    log.out('Renderer', 'Init')
    document.body.appendChild(this.canvas)

    this.canvas.width = window.innerWidth
    this.canvas.height = window.innerHeight

    this.resize()
    window.addEventListener('resize', this.boundResize)

    requestAnimationFrame(this.boundDraw)
  }

  public stop() {
    log.out('Renderer', 'Shutdown')
    this.run = false
    window.removeEventListener('resize', this.boundResize)
    this.canvas.remove()
  }

  private resize() {
    this.canvas.width = window.innerWidth
    this.canvas.height = window.innerHeight

    if (window.innerWidth > window.innerHeight) {
      this.camera.scale = window.innerWidth / this.width
    } else {
      this.camera.scale = window.innerHeight / this.height
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

  private animate(mob: Mobile, delta: number) {
    const last = this.lastAction.get(mob.id)
    const time =
      last === mob.action ? this.frameCounter.get(mob.id) || Math.random() : 0
    const info = (spritemap as any)[mob.sprite][mob.action]
    const loop = info.loop ?? true

    this.frameCounter.set(mob.id, time + delta * 4)
    this.lastAction.set(mob.id, mob.action)

    return Math.floor(
      loop ? time % info.frames : Math.min(time, info.frames - 1),
    )
  }

  private drawTile(type: string, sx: number, sy: number, x: number, y: number) {
    if (!this.assets[type]) {
      this.context.fillStyle = 'magenta'
      this.context.fillRect(x * 16, y * 16, 16, 16)
      return
    }

    this.context.imageSmoothingEnabled = false
    this.context.drawImage(
      this.assets[type],
      sx * 16,
      sy * 16,
      16,
      16,
      window.innerWidth / 2 + (x * 16 - this.camera.x) * this.camera.scale,
      window.innerHeight / 2 + (y * 16 - this.camera.y) * this.camera.scale,
      16 * this.camera.scale,
      16 * this.camera.scale,
    )
  }

  private drawText(
    text: string,
    x: number,
    y: number,
    hAlign: CanvasTextAlign = 'center',
    vAlign: CanvasTextBaseline = 'top',
  ) {
    this.context.font = 'small-caps bold 12pt Arial'
    this.context.textAlign = hAlign
    this.context.textBaseline = vAlign
    this.context.fillStyle = 'rgb(124, 240, 255)'
    this.context.strokeStyle = 'black'
    this.context.lineWidth = 3

    const finalX = Math.floor(
      window.innerWidth / 2 + (x - this.camera.x) * this.camera.scale,
    )
    const finalY = Math.floor(
      window.innerHeight / 2 + (y - this.camera.y) * this.camera.scale,
    )

    this.context.strokeText(text, finalX, finalY)
    this.context.fillText(text, finalX, finalY)
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

  public drawTileMap() {
    const minX = this.camera.x / 16 - 13
    const minY = this.camera.y / 16 - 13
    const maxX = this.camera.x / 16 + 13
    const maxY = this.camera.y / 16 + 13

    let x, y
    for (y = minY; y < maxY; y++) {
      for (x = minX; x < maxX; x++) {
        this.drawTile('grassTiles', 1, 1, Math.floor(x), Math.floor(y))
      }
    }
  }

  public draw(time: number) {
    const delta = (time - this.lastTime) / 1000

    if (!this.run) return

    this.context.fillStyle = 'black'
    this.context.fillRect(0, 0, window.innerWidth, window.innerHeight)

    this.drawTileMap()

    if (this.state.self) {
      this.camera.set(this.state.self.x * 16 + 8, this.state.self.y * 16 + 8)
    }

    ;[...this.state.mobs.values()]
      .sort((a, b) => a.y - b.y)
      .forEach((mob) => {
        const { id, x, y, name, sprite, action } = mob

        const frame = this.animate(mob, delta)
        this.drawSprite(sprite, action, frame, x, y)
        this.drawText(name, x * 16 + 8, y * 16 - 2)
      })

    this.lastTime += delta * 1000
    requestAnimationFrame(this.boundDraw)
  }
}
