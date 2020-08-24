interface Animation {
  name: string
  x: number
  y: number
  frames: number
  fps: number
  loop: boolean
  next?: string
}

export default class SpriteData {
  public set = 'Castle'
  public animations: Animation[] = []

  constructor(public name: string) {}

  serialize() {
    return { ...this }
  }

  deserialize(data: any) {
    Object.assign(this, data)
  }
}
