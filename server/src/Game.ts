import Engine from '../../common/engine/Engine'
import NetworkServer from './systems/NetworkServer'
import Movement from './systems/Movement'
import WorldComposer from './systems/WorldComposer'
import PopulationManager from './systems/PopulationManager'

export default class Game {
  public engine = new Engine()

  public constructor() {
    this.engine.addSystem(NetworkServer)
    this.engine.addSystem(WorldComposer)
    this.engine.addSystem(PopulationManager)
    this.engine.addSystem(Movement)

    this.engine.start()
  }
}
