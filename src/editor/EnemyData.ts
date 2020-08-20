export default class EnemyData {
  public name: string = 'New Enemy'
  public sprite = {
    set: 'Castle',
    x: 0,
    y: 0,
  }

  serialize() {
    return this
  }

  deserialize(data: any) {
    Object.assign(this, data)
  }
}
