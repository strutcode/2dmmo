import Observable from '../../common/Observable'

export interface MobileOptions {
  name?: string
  sprite?: string
  hp?: number
  str?: number
  x?: number
  y?: number
}

export default class Mobile {
  public onMove = new Observable()
  public onDamage = new Observable()
  public onKill = new Observable()
  public onDestroy = new Observable()

  public name = 'Soandso'
  public sprite = 'soldier'

  private pos = [0, 0]
  private stats = {
    hp: 100,
    str: 10,
  }

  constructor(public id: string, public options: MobileOptions = {}) {
    if (options.name) this.name = options.name
    if (options.sprite) this.sprite = options.sprite

    if (options.x || options.y) {
      this.teleport(options.x ?? 0, options.y ?? 0)
    }

    this.stats = {
      hp: options.hp ?? 100,
      str: options.str ?? 10,
    }
  }

  public get x() {
    return this.pos[0]
  }

  public get y() {
    return this.pos[1]
  }

  public get strength() {
    return this.stats.str
  }

  public move(x: number, y: number) {
    this.teleport(this.x + x, this.y + y)
  }

  public teleport(x: number, y: number) {
    this.pos[0] = x
    this.pos[1] = y

    this.onMove.notify()
  }

  public get hp() {
    return this.stats.hp
  }

  public damage(amount: number) {
    this.stats.hp -= amount
    this.onDamage.notify()

    if (this.hp <= 0) {
      this.kill()
    }
  }

  public kill() {
    this.stats.hp = 0
    this.onKill.notify()
    this.destroy()
  }

  public destroy() {
    this.onDestroy.notify()
  }
}
