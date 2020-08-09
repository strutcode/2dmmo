import Observable from '../../common/Observable'

export default class Player {
  public onMove = new Observable()

  private pos = [12, 6]

  constructor(public id: string) {}

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
