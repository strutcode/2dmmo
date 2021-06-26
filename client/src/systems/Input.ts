import System from '../../../common/engine/System'
import InputQueue from '../components/InputQueue'

/** Handles all player input directly */
export default class Input extends System {
  /** Defines the possible actions a player can take */
  public keyMap: Record<string, string> = {
    // TODO: Need a more dynamic way to define this
    ArrowUp: 'up',
    ArrowDown: 'down',
    ArrowLeft: 'left',
    ArrowRight: 'right',
    w: 'up',
    s: 'down',
    a: 'left',
    d: 'right',
  }

  public start() {
    // Listen for player input
    window.addEventListener('keydown', (ev) => {
      // Early out for unmapped key presses
      if (!this.keyMap[ev.key]) return

      // Record it on the input queue
      this.engine.with(InputQueue, (queue) => {
        queue.addAction(this.keyMap[ev.key])
      })
    })

    // Mobile/touch input
    window.addEventListener('touchend', (ev) => {
      const touch = ev.changedTouches[0]
      this.engine.with(InputQueue, (queue) => {
        // Find the touch position relative to the viewport center; negative for up and left, positive for down and right
        const centerOffsetX = Math.abs(touch.clientX - window.innerWidth / 2)
        const centerOffsetY = Math.abs(touch.clientY - window.innerHeight / 2)

        // If the touch was more horizontally offset
        if (centerOffsetX > centerOffsetY) {
          // Move left/right based on the sign of the offset
          if (centerOffsetX <= 0) {
            queue.addAction('left')
          } else {
            queue.addAction('right')
          }
        }
        // If the touch was more vertically offset
        else {
          // Move up/down based on the sign of the offset
          if (centerOffsetY <= 0) {
            queue.addAction('up')
          } else {
            queue.addAction('down')
          }
        }
      })
    })
  }

  public update() {
    this.engine.with(InputQueue, (queue) => {
      queue.actions = []
    })
  }
}
