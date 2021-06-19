import System from '../../../common/engine/System'
import InputQueue from '../components/InputQueue'

export default class Input extends System {
  public keyMap: Record<string, string> = {
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
    window.addEventListener('keydown', (ev) => {
      if (!this.keyMap[ev.key]) return

      const queue = this.engine.getComponent(InputQueue)

      queue?.addAction(this.keyMap[ev.key])
    })
  }

  public update() {
    const queue = this.engine.getComponent(InputQueue)

    if (queue) {
      queue.actions = []
    }
  }
}