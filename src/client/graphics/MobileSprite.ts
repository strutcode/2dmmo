import Mobile from '../entities/Mobile'
import NameTag from './NameTag'
import Sprite from './Sprite'

export default class MobileSprite {
  private sprite = new Sprite({ x: 0, y: 0, set: 'Castle' })
  private nameTag = new NameTag(this.mob.name)

  constructor(private mob: Mobile) {
    this.sprite.x = mob.x
    this.sprite.y = mob.y
    this.nameTag.x = mob.x * 16
    this.nameTag.y = mob.y * 16

    this.mob.onMove.observe((x, y) => {
      this.sprite.x = x
      this.sprite.y = y
      this.nameTag.x = x * 16
      this.nameTag.y = y * 16
    })
  }

  public draw(ctx: CanvasRenderingContext2D) {
    this.sprite.draw(ctx)
    this.nameTag.draw(ctx)
  }
}
