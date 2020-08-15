import Camera from './Camera'
import GameState from '../GameState'
import Mobile from '../entities/Mobile'
import spritemap from '../../common/data/spritemap'
import HitIndicator from './HitIndicator'

interface Transition {
  x1: number
  y1: number
  x2: number
  y2: number
  a: number
}

interface TextProperties {
  color?: string
  size?: number
  x?: number
  y?: number
  hAlign?: CanvasTextAlign
  vAlign?: CanvasTextBaseline
}

interface SpriteProperties {
  sprite: string
  action: string
  frame: number
  x: number
  y: number
  flip?: boolean
}

export default class Renderer {
  private canvas = document.createElement('canvas')
  private context: CanvasRenderingContext2D
  private flipCanvas = document.createElement('canvas')
  private flipCtx: CanvasRenderingContext2D

  private boundDraw = this.draw.bind(this)
  private boundResize = this.resize.bind(this)
  private run = true
  private width = 16 * 25
  private height = 16 * 25
  private lastTime = performance.now()

  private camera = new Camera()
  private assets: Record<string, HTMLImageElement> = {}
  private frameCounter = new Map<string, number>()
  private lastAction = new Map<string, string>()
  private transitionState = new Map<string, Transition>()
  private hitIndicators: HitIndicator[] = []

  public constructor(private state: GameState) {
    const contextA = this.canvas.getContext('2d')
    const contextB = this.flipCanvas.getContext('2d')

    if (!contextA || !contextB) {
      throw `Couldn't initialize renderer`
    }

    this.context = contextA
    this.flipCtx = contextB
  }

  public start() {
    log.out('Renderer', 'Init')
    document.body.appendChild(this.canvas)

    this.canvas.width = window.innerWidth
    this.canvas.height = window.innerHeight
    this.flipCanvas.width = 16
    this.flipCanvas.height = 16

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

  public mobileHit(source: Mobile, target: Mobile, amount: number) {
    const indicator = new HitIndicator(source, target, amount)

    this.hitIndicators.push(indicator)
    indicator.onDie.observe(() => {
      this.hitIndicators = this.hitIndicators.filter((i) => i !== indicator)
    })
  }

  public draw(time: number) {
    const delta = (time - this.lastTime) / 1000

    if (!this.run) return

    this.context.fillStyle = 'black'
    this.context.fillRect(0, 0, window.innerWidth, window.innerHeight)

    this.drawTileMap()
    ;[...this.state.mobs.values()]
      .sort((a, b) => a.y - b.y)
      .forEach((mob) => {
        const { name, sprite, action, flip } = mob

        const frame = this.animate(mob, delta)
        const { x, y } = this.transition(mob, delta)

        if (mob === this.state.self) {
          this.camera.set(x + 8, y + 8)
        }

        this.drawSprite({ sprite, action, frame, x, y, flip })
        this.drawText(name, {
          x: x + 8,
          y: y - 2,
        })
      })

    this.hitIndicators.forEach((indicator) => {
      this.drawText(indicator.text, {
        color: 'red',
        size: 14,
        x: indicator.x,
        y: indicator.y,
      })
      indicator.update(delta)
    })

    this.lastTime += delta * 1000
    requestAnimationFrame(this.boundDraw)
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

  private animate(mob: Mobile, delta: number) {
    const last = this.lastAction.get(mob.id)
    const time =
      last === mob.action ? this.frameCounter.get(mob.id) || Math.random() : 0
    const info = (spritemap as any)[mob.sprite][mob.action]
    const loop = info.loop ?? true
    const fps = info.fps ?? 4
    const next = info.next

    this.frameCounter.set(mob.id, time + delta)
    this.lastAction.set(mob.id, mob.action)

    if (!loop && next && time * fps > info.frames) {
      mob.action = next
    }

    return Math.floor(
      loop ? (time * fps) % info.frames : Math.min(time * fps, info.frames - 1),
    )
  }

  private transition(mob: Mobile, delta: number) {
    const mX = mob.x * 16
    const mY = mob.y * 16
    const t = this.transitionState.get(mob.id) ?? {
      x1: mX,
      y1: mY,
      x2: mX,
      y2: mY,
      a: 1,
    }

    if (t.x2 !== mX || t.y2 !== mY) {
      t.x1 = t.x2
      t.y1 = t.y2
      t.x2 = mX
      t.y2 = mY
      t.a = 0
    }

    if (t.a < 1) {
      t.a += delta * 4
      if (t.a > 1) t.a = 1
    }

    this.transitionState.set(mob.id, t)

    return {
      x: t.x1 + (t.x2 - t.x1) * t.a,
      y: t.y1 + (t.y2 - t.y1) * t.a,
    }
  }

  private drawTile(
    type: string,
    sx: number,
    sy: number,
    x: number,
    y: number,
    flip = false,
  ) {
    const scale = this.camera.scale
    const finalX = Math.floor(
      window.innerWidth / 2 + (x - this.camera.x) * scale,
    )
    const finalY = Math.floor(
      window.innerHeight / 2 + (y - this.camera.y) * scale,
    )
    const size = Math.ceil(16 * scale)

    if (!this.assets[type]) {
      this.context.fillStyle = 'magenta'
      this.context.fillRect(finalX, finalY, size, size)
      return
    }

    if (flip) {
      this.flipCtx.clearRect(0, 0, -16, 16)
      this.flipCtx.setTransform(-1, 0, 0, 1, 0, 0)
      this.flipCtx.drawImage(
        this.assets[type],
        sx * 16,
        sy * 16,
        16,
        16,
        0,
        0,
        -16,
        16,
      )
    }

    this.context.imageSmoothingEnabled = false
    this.context.drawImage(
      flip ? this.flipCanvas : this.assets[type],
      flip ? 0 : sx * 16,
      flip ? 0 : sy * 16,
      16,
      16,
      finalX,
      finalY,
      size,
      size,
    )
  }

  private drawText(text: string, options?: TextProperties) {
    options = options || {}
    const x = options.x ?? 0
    const y = options.y ?? 0
    const size = options.size ?? 12

    this.context.font = `small-caps bold ${size}pt Arial`
    this.context.textAlign = options.hAlign || 'center'
    this.context.textBaseline = options.vAlign || 'top'
    this.context.fillStyle = options.color ?? 'rgb(124, 240, 255)'
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

  private drawSprite(options: SpriteProperties) {
    const { sprite, action, frame, x, y, flip } = options

    if (!(spritemap as any)[sprite][action]) {
      this.context.fillStyle = 'magenta'
      this.context.fillRect(x, y, 16, 16)
      return
    }

    const { row, frames } = (spritemap as any)[sprite][action]
    this.drawTile(
      spritemap[sprite as keyof typeof spritemap]._asset,
      Math.floor(frame % frames),
      row,
      x,
      y,
      flip,
    )
  }

  private drawTileMap() {
    const minX = Math.floor(this.camera.x / 16) * 16 - 14 * 16
    const minY = Math.floor(this.camera.y / 16) * 16 - 14 * 16
    const maxX = Math.floor(this.camera.x / 16) * 16 + 14 * 16
    const maxY = Math.floor(this.camera.y / 16) * 16 + 14 * 16

    let x, y
    for (y = minY; y < maxY; y += 16) {
      for (x = minX; x < maxX; x += 16) {
        this.drawTile('grassTiles', 1, 1, Math.floor(x), Math.floor(y))
      }
    }
  }
}
