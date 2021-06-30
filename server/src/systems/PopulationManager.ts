import Entity from '../../../common/engine/Entity'
import System from '../../../common/engine/System'
import Mobile from '../components/Mobile'
import TilePosition from '../../../common/components/TilePosition'
import { performance } from 'perf_hooks'
import Affectable from '../components/Affectable'
import Input from '../components/Input'

type Deer = {
  entity: Entity
  moveTimer: number
}

export default class PopulationManager extends System {
  private deer: Deer[] = []
  private lastTime = performance.now()

  public update() {
    // If there are fewer than 10 deer
    if (this.deer.length < 10) {
      // Spawn a new one
      const entity = this.engine.createEntity([
        [Mobile, { name: 'Deerling', sprite: 'deer' }],
        Input,
        Affectable,
        [
          TilePosition,
          {
            x: Math.floor(Math.random() * 31) - 13,
            y: Math.floor(Math.random() * 31) - 13,
          },
        ],
      ])

      // Remember it
      this.deer.push({
        entity,
        moveTimer: 0,
      })
    }

    // Measure the amount of time that's passed
    const now = performance.now()
    const deltaTime = now - this.lastTime

    // Update deer
    this.deer.forEach((deer) => {
      deer.entity.with(Input, (input) => {
        // If it's time to move
        if (deer.moveTimer <= 0) {
          // Pick a random cardinal direction
          const dir = ['up', 'down', 'left', 'right'][
            Math.floor(Math.random() * 4)
          ]

          // Change position based on it
          input.addInput(dir)

          // Reset the timer to 2 - 3 seconds
          deer.moveTimer = Math.floor(Math.random() * 2000) + 1000
        }

        // Update the timer
        deer.moveTimer -= deltaTime
      })
    })

    // Save the current time for the next delta
    this.lastTime = now
  }
}
