import { performance } from 'perf_hooks'

import BaseBehavior from '../BaseBehavior'
import Input from '../components/Input'

export default class RandomWalk extends BaseBehavior {
  protected moveTimer = 0
  protected lastTime = performance.now()

  public tick() {
    this.entity?.with(Input, (input) => {
      const now = performance.now()
      const deltaTime = now - this.lastTime

      // Update the timer
      this.moveTimer -= deltaTime

      // If it's time to move
      if (this.moveTimer <= 0) {
        // Pick a random cardinal direction
        const dir = ['up', 'down', 'left', 'right'][
          Math.floor(Math.random() * 4)
        ]

        // Change position based on it
        input.addInput(dir)

        // Reset the timer to 2 - 3 seconds
        this.moveTimer = Math.floor(Math.random() * 2000) + 1000
      }

      // Record the tick
      this.lastTime = now
    })
  }
}
