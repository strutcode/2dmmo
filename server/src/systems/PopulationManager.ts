import Entity from '../../../common/engine/Entity'
import System from '../../../common/engine/System'
import Mobile from '../components/Mobile'
import TilePosition from '../components/TilePosition'
import { performance } from 'perf_hooks'

type Deer = {
  entity: Entity
  moveTimer: number
}

export default class PopulationManager extends System {
  private deer: Deer[] = []
  private lastTime = performance.now()

  public update() {
    if (this.deer.length < 10) {
      const entity = this.engine.createEntity([Mobile, TilePosition])

      const mob = entity.getComponent(Mobile)
      if (mob) {
        mob.name = 'Deerling'
        mob.sprite = 'deer'
      }

      const pos = entity.getComponent(TilePosition)
      if (pos) {
        pos.x = Math.floor(Math.random() * 31) - 13
        pos.y = Math.floor(Math.random() * 31) - 13
      }

      this.deer.push({
        entity,
        moveTimer: 0,
      })
    }

    const now = performance.now()
    const deltaTime = now - this.lastTime
    this.deer.forEach((deer) => {
      const pos = deer.entity.getComponent(TilePosition)

      if (pos && deer.moveTimer <= 0) {
        const dir = Math.floor(Math.random() * 4)

        if (dir === 0) {
          if (pos.x > -13) pos.x--
        }
        if (dir === 1) {
          if (pos.x < 28) pos.x++
        }
        if (dir === 2) {
          if (pos.y > -13) pos.y--
        }
        if (dir === 3) {
          if (pos.y < 28) pos.y++
        }

        deer.moveTimer = Math.floor(Math.random() * 2000) + 1000
      }

      deer.moveTimer -= deltaTime
    })

    this.lastTime = now
  }
}
