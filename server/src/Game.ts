import Engine from '../../common/engine/Engine'
import NetworkServer from './systems/NetworkServer'
import Movement from './systems/Movement'

export default class Game {
  public engine = new Engine()

  public constructor() {
    this.engine.addSystem(NetworkServer)
    this.engine.addSystem(Movement)

    this.engine.start()
  }
}
