interface Animation {
  name: string
  x: number
  y: number
  frames: number
  fps: number
  loop: boolean
}

export default class EnemyData {
  public name: string = 'New Enemy'
  public sprite = {
    set: 'Castle',
    animations: [] as Animation[],
  }

  constructor(public key: string) {}

  serialize() {
    return { ...this }
  }

  deserialize(data: any) {
    this.key = data.key ?? this.key
    this.name = data.name ?? this.name
    Object.assign(
      this.sprite,
      {
        set: 'Castle',
        animations: [] as Animation[],
      },
      data.sprite,
    )
  }
}
