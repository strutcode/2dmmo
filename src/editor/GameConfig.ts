export default class GameConfig {
  defaultMap?: string = undefined

  serialize() {
    const { defaultMap } = this

    return {
      defaultMap,
    }
  }

  deserialize(data: object) {
    Object.assign(this, data)
  }
}
