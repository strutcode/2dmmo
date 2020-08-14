export default class Mobile {
  public static all: Mobile[] = []

  public static anyAt(x: number, y: number) {
    return !!Mobile.all.find((m) => m.x === x && m.y === y)
  }

  public sprite = 'soldier'
  public action = 'idle'
  public flip = false

  private pos: [number, number]
  private timeout: any

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

  public move(x: number, y: number) {
    this.teleport(this.pos[0] + x, this.pos[1] + y)
  }

  public teleport(x: number, y: number) {
    if (x !== this.pos[0]) this.flip = x < this.pos[0]

    this.pos[0] = x
    this.pos[1] = y

    if (this.action !== 'walk') {
      this.action = 'walk'
    }

    if (this.timeout) clearTimeout(this.timeout)
    this.timeout = setTimeout(() => (this.action = 'idle'), 1000)
  }

  public kill() {
    this.action = 'die'
    this.name += `'s corpse`

    setTimeout(() => {
      this.destroy()
    }, 4000)
  }

  public destroy() {
    Mobile.all = Mobile.all.filter((m) => m !== this)
  }
}
