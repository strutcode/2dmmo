import GameState from '../GameState'
import Observable from '../../common/Observable'

export default class Input {
  public onAction = new Observable<(name: string) => void>()

  constructor(private state: GameState) {}

  public start() {
    document.addEventListener('keydown', this.keyboardHandler.bind(this))
    document.addEventListener('touchstart', this.touchHandler.bind(this))
  }

  public stop() {
    document.removeEventListener('keydown', this.keyboardHandler.bind(this))
    document.removeEventListener('touchstart', this.touchHandler.bind(this))
  }

  private keyboardHandler(ev: KeyboardEvent) {
    const getAction = () => {
      switch (ev.key.toLowerCase()) {
        case 'w':
          return 'up'
        case 's':
          return 'down'
        case 'a':
          return 'left'
        case 'd':
          return 'right'
        default:
          return undefined
      }
    }

    const name = getAction()

    if (name) {
      this.onAction.notify(name)
    }
  }

  private touchHandler(ev: TouchEvent) {
    const getAction = () => {
      const touch = ev.touches[0]
      const marginX = window.innerWidth / 4
      const marginY = window.innerHeight / 4

      if (touch.clientX < marginX) {
        return 'left'
      } else if (touch.clientX > window.innerWidth - marginX) {
        return 'right'
      } else if (touch.clientY < marginY) {
        return 'up'
      } else if (touch.clientY > window.innerHeight - marginY) {
        return 'down'
      }
    }

    const name = getAction()

    if (name) {
      this.onAction.notify(name)
    }
  }
}
