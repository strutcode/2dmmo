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
      const queue = this.engine.getComponent(InputQueue)
      queue?.addAction(this.keyMap[ev.key])
    })
  }

  public update() {
    const queue = this.engine.getComponent(InputQueue)

    if (queue) {
      // Clear out old inputs
      queue.actions = []
    }
  }
}
