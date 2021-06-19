import Engine from '../../common/engine/Engine'
import Input from './systems/Input'
import NetworkClient from './systems/NetworkClient'

export default class Game {
  public engine = new Engine()

  public constructor() {
    this.engine.addSystem(NetworkClient)
    this.engine.addSystem(Input)

    this.engine.start()
  }
}
