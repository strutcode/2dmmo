export default class EnemyData {
  public name: string = 'New Enemy'
  public sprite = {
    set: 'Castle',
    x: 0,
    y: 0,
  }

  constructor(public key: string) {}

  serialize() {
    return { ...this }
  }

  deserialize(data: any) {
    Object.assign(this, data)
  }
}
