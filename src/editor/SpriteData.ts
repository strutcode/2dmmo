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
    const result: Record<string, any> = {}

    result.name = this.name
    result.set = this.set
    result.animations = this.animations.reduce((acc, anim) => {
      acc[anim.name] = {
        x: +anim.x,
        y: +anim.y,
        frames: +anim.frames,
        fps: +anim.fps,
        loop: !!anim.loop,
        next: anim.next,
      }

      return acc
    }, {} as any)

    return result
  }

  deserialize(data: any) {
    Object.assign(this, data)

    this.animations = Object.entries(data.animations).reduce(
      (acc, [name, anim]) => {
        acc.push({
          name,
          ...(anim as any),
        })

        return acc
      },
      [] as any[],
    )
  }
}
