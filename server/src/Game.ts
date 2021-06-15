import Engine from '../../common/engine/Engine'
import NetworkServer from './systems/NetworkServer'

export default class Game {
  public engine = new Engine()

  public constructor() {
    this.engine.addSystem(NetworkServer)
  }
}
