export default class Camera {
  private pos = [0, 0]
  public scale = 1

  public get x() {
    return this.pos[0]
  }

  public get y() {
    return this.pos[1]
  }

  public set(x: number, y: number) {
    this.pos[0] = x
    this.pos[1] = y
  }
}
