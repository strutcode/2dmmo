import GameState from '../GameState'
import Observable from '../../common/Observable'

export default class Input {
  public onAction = new Observable<(name: string) => void>()

  constructor(private state: GameState) {}

  public start() {
    document.addEventListener('keydown', this.handler.bind(this))
  }

  public stop() {
    document.removeEventListener('keydown', this.handler.bind(this))
  }

  private handler(ev: KeyboardEvent) {
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
}
