import Observable from '../../common/Observable'

export default class Mobile {
  public static all: Mobile[] = []

  public static firstAt(x: number, y: number) {
    return Mobile.all.find(m => m.x === x && m.y === y)
  }

  public sprite = 'soldier'
  public action = 'idle'
  public flip = false

  public onMove = new Observable<(x: number, y: number) => void>()
  public onDestroy = new Observable()

  private pos: [number, number]

  constructor(
    public id: string,
    public name: string = 'Soandso',
    x = 0,
    y = 0,
  ) {
    this.pos = [x, y]
    Mobile.all.push(this)
  }

  public get x() {
    return this.pos[0]
  }

  public get y() {
    return this.pos[1]
  }

  public bump(who: Mobile) {
    if (who.x > this.x) {
      this.flip = false
    } else if (who.x < this.x) {
      this.flip = true
    }
  }

  public move(x: number, y: number) {
    this.teleport(this.pos[0] + x, this.pos[1] + y)
  }

  public teleport(x: number, y: number) {
    if (x !== this.pos[0]) this.flip = x < this.pos[0]

    this.pos[0] = x
    this.pos[1] = y

    this.action = 'move'
    this.onMove.notify(x, y)
  }

  public kill() {
    this.action = 'die'
    this.name += `'s corpse`

    setTimeout(() => {
      this.destroy()
    }, 10000)
  }

  public destroy() {
    this.onDestroy.notify()
    Mobile.all = Mobile.all.filter(m => m !== this)
  }
}
