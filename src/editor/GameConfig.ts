export default class GameConfig {
  defaultMap?: string = undefined
  playerSprite?: string = undefined

  serialize() {
    return { ...this }
  }

  deserialize(data: object) {
    Object.assign(this, data)
  }
}
