import {
  Application,
  Container,
  Graphics,
  Sprite as PixiSprite,
  Texture,
} from 'pixi.js'

import Entity from '../../../common/engine/Entity'
import System from '../../../common/engine/System'
import CameraFollow from '../components/CameraFollow'
import InputQueue from '../components/InputQueue'
import LatencyGraph from '../components/LatencyGraph'
import Sprite from '../components/Sprite'

export default class Renderer2d extends System {
  private app = new Application({
    resizeTo: window,
  })
  private world = new Container()
  private latency = new Graphics()

  private spriteMap = new Map<Entity, PixiSprite>()

  public start() {
    setTimeout(() => {
      document.body.appendChild(this.app.view)

      this.world.scale.x = 4
      this.world.scale.y = 4
      this.app.stage.addChild(this.world)

      this.app.stage.addChild(this.latency)
    })
  }

  public update() {
    this.engine.getAllComponents(Sprite).forEach((sprite) => {
      if (!this.spriteMap.has(sprite.entity)) {
        const newSprite = PixiSprite.from(Texture.WHITE)

        this.world.addChild(newSprite)

        this.spriteMap.set(sprite.entity, newSprite)
      }

      const queue = sprite.entity.getComponent(InputQueue)

      if (queue) {
        queue.actions.forEach((action) => {
          if (action === 'up') {
            sprite.y -= 16
          } else if (action === 'down') {
            sprite.y += 16
          } else if (action === 'left') {
            sprite.x -= 16
          } else if (action === 'right') {
            sprite.x += 16
          }
        })
      }

      const pixiSprite = this.spriteMap.get(sprite.entity)

      if (pixiSprite) {
        pixiSprite.x = sprite.x
        pixiSprite.y = sprite.y
        pixiSprite.rotation = sprite.r
        pixiSprite.width = sprite.width
        pixiSprite.height = sprite.height
      }
    })

    const target = this.engine.getComponent(CameraFollow)

    if (target) {
      const targetSprite = target.entity.getComponent(Sprite)

      if (targetSprite) {
        this.world.x =
          this.app.view.width / 2 - targetSprite.x * this.world.scale.x
        this.world.y =
          this.app.view.height / 2 - targetSprite.y * this.world.scale.y
      }
    }

    const graph = this.engine.getComponent(LatencyGraph)

    if (graph) {
      this.latency.x = this.app.view.width - 100
      this.latency.y = this.app.view.height - 50

      this.latency.clear()

      // wtf pixi
      this.latency.beginFill(0xffffff, 0)
      this.latency.drawRect(0, 0, 100, 50)
      this.latency.endFill()

      const history = graph.historyWindow
      const max = 100
      const barWidth = this.latency.width / 50

      this.latency.beginFill(0xff0000)
      history.reverse().forEach((point, n) => {
        const percent = point / max

        this.latency.drawRect(
          this.latency.width - barWidth * n,
          this.latency.height - this.latency.height * percent,
          barWidth,
          this.latency.height * percent,
        )
      })
      this.latency.endFill()
    }
  }
}
