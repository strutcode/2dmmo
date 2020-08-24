export default class EnemyData {
  public name: string = 'New Enemy'
  public sprite?: string

  constructor(public key: string) {}

  serialize() {
    return { ...this }
  }

  deserialize(data: any) {
    Object.assign(this, data)
  }
}
