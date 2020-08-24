import Camera from './Camera'
import GameState from '../GameState'
import Mobile from '../entities/Mobile'
import MobileSprite from './MobileSprite'
import HitIndicator from './HitIndicator'
import enemies from '../../common/data/enemies'
import tilesets from '../../common/data/tilesets'
import sprites from '../../common/data/sprites'

export default class Renderer {
  private canvas = document.createElement('canvas')
  private context: CanvasRenderingContext2D
  private flipCanvas = document.createElement('canvas')
  private flipCtx: CanvasRenderingContext2D

  private boundDraw = this.draw.bind(this)
  private boundResize = this.resize.bind(this)
  private run = true
  private width = 25 * 16
  private height = 25 * 16
  private lastTime = performance.now()

  private camera = new Camera()
  private sprites = new Map<string, MobileSprite>()
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

  public async load() {
    const loadImage = (src: string) =>
      new Promise(resolve => {
        const img = new Image()
        img.src = src
        img.onload = () => resolve(img)
      })

    log.out('Renderer', 'Loading assets')
    await Promise.all(
      Object.keys(tilesets).map(key => loadImage(tilesets[key])),
    )
    await Promise.all(
      Object.keys(sprites).map(key => loadImage(enemies[sprites[key].set])),
    )
    log.out('Renderer', 'Done loading assets')
  }

  public start() {
    log.out('Renderer', 'Init')
    document.body.appendChild(this.canvas)

    this.canvas.width = window.innerWidth
    this.canvas.height = window.innerHeight
    this.flipCanvas.width = 16
    this.flipCanvas.height = 16

    this.state.onMobileAdd.observe(mob => {
      this.sprites.set(mob.id, new MobileSprite(mob))
    })

    this.state.onMobileRemove.observe(mob => {
      this.sprites.delete(mob.id)
    })

    this.state.mobs.forEach(mob => {
      this.sprites.set(mob.id, new MobileSprite(mob))
    })

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

  public mobileHit(source: Mobile, target: Mobile, amount: number) {
    const indicator = new HitIndicator(source, target, amount)
    console.log(source.name, 'hit', target.name, 'for', amount)

    this.hitIndicators.push(indicator)
    indicator.onDie.observe(() => {
      this.hitIndicators = this.hitIndicators.filter(i => i !== indicator)
    })
  }

  public draw(time: number) {
    const delta = (time - this.lastTime) / 1000

    if (!this.run) return

    this.context.setTransform(1, 0, 0, 1, 0, 0)
    this.context.fillStyle = 'black'
    this.context.fillRect(0, 0, window.innerWidth, window.innerHeight)

    if (this.state.self) {
      const sprite = this.sprites.get(this.state.self.id)
      if (sprite) {
        this.camera.set(sprite.x + 8, sprite.y + 8)
      }
    }

    this.context.setTransform(
      this.camera.scale,
      0,
      0,
      this.camera.scale,
      -this.camera.x * this.camera.scale + window.innerWidth / 2,
      -this.camera.y * this.camera.scale + window.innerHeight / 2,
    )

    if (this.state.map) {
      this.state.map.draw(this.context, delta)
    }

    ;[...this.sprites.values()]
      .sort((a, b) => a.y - b.y)
      .forEach(sprite => {
        sprite.draw(this.context, delta)
      })

    this.hitIndicators.forEach(indicator => {
      indicator.draw(this.context, delta)
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
}
