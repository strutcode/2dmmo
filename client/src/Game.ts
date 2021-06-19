import Engine from '../../common/engine/Engine'
import Input from './systems/Input'
import NetworkClient from './systems/NetworkClient'
import Renderer2d from './systems/Renderer2d'

export default class Game {
  public engine = new Engine()

  public constructor() {
    this.engine.addSystem(NetworkClient)
    this.engine.addSystem(Renderer2d)
    this.engine.addSystem(Input)

    this.engine.start()
  }
}
