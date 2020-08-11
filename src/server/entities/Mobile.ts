import Observable from '../../common/Observable'

interface MobileOptions {
  name?: string
  sprite?: string
  x?: number
  y?: number
}

export default class Mobile {
  public onMove = new Observable()

  private pos = [0, 0]
  public name = 'Soandso'
  public sprite = 'soldier'

  constructor(public id: string, public options: MobileOptions = {}) {
    if (options.name) this.name = options.name
    if (options.sprite) this.sprite = options.sprite

    if (options.x || options.y) {
      this.teleport(options.x ?? 0, options.y ?? 0)
    }
  }

  public get x() {
    return this.pos[0]
  }

  public get y() {
    return this.pos[1]
  }

  public move(x: number, y: number) {
    this.teleport(this.x + x, this.y + y)
  }

  public teleport(x: number, y: number) {
    this.pos[0] = x
    this.pos[1] = y

    this.onMove.notify()
  }
}
