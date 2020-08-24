import sprites from '../../common/data/sprites'
import Mobile from '../entities/Mobile'
import NameTag from './NameTag'
import Sprite from './Sprite'

export default class MobileSprite {
  private spriteData: Record<string, any> = sprites[this.mob.sprite]
  private sprite = new Sprite({ x: 0, y: 0, set: this.spriteData.set })
  private nameTag = new NameTag(this.mob)
  private lerp = {
    x1: 0,
    y1: 0,
    x2: 0,
    y2: 0,
    a: 0,
  }
  private animTime = Math.random()
  private lastAction = this.mob.action

  constructor(private mob: Mobile) {
    this.sprite.x = mob.x * 16
    this.sprite.y = mob.y * 16
    this.nameTag.x = mob.x * 16
    this.nameTag.y = mob.y * 16
    this.lerp.x1 = this.lerp.x2 = mob.x * 16
    this.lerp.y1 = this.lerp.y2 = mob.y * 16

    this.mob.onMove.observe((x, y) => {
      this.lerp.x1 = this.sprite.x
      this.lerp.y1 = this.sprite.y
      this.lerp.x2 = x * 16
      this.lerp.y2 = y * 16
      this.lerp.a = 0
    })

    const anim = this.spriteData.animations[mob.action]
    if (anim) {
      this.sprite.data.x = anim.x
      this.sprite.data.y = anim.y
    }
  }

  public get x() {
    return this.sprite.x
  }
  public get y() {
    return this.sprite.y
  }

  public draw(ctx: CanvasRenderingContext2D, delta: number) {
    this.lerp.a += delta * 4

    if (this.lerp.a >= 1) {
      this.lerp.a = 1
      this.lerp.x1 = this.lerp.x2
      this.lerp.y1 = this.lerp.y2
    } else {
      const { x1, y1, x2, y2, a } = this.lerp

      this.sprite.x = this.nameTag.x = x1 + (x2 - x1) * a
      this.sprite.y = this.nameTag.y = y1 + (y2 - y1) * a
    }

    const info = this.spriteData.animations[this.mob.action]
    if (info) {
      const loop = info.loop ?? true
      const fps = info.fps ?? 4
      const next = info.next

      this.animTime += delta

      if (this.mob.action !== this.lastAction) this.animTime = 0
      this.lastAction = this.mob.action

      if (!loop && next && this.animTime * fps > info.frames) {
        this.mob.action = next
      }

      const frame = loop
        ? (this.animTime * fps) % info.frames
        : Math.min(this.animTime * fps, info.frames - 1)

      this.sprite.data.x = Math.floor(info.x + frame)
      this.sprite.data.y = info.y
    }

    this.sprite.draw(ctx)
    this.nameTag.draw(ctx)
  }
}
