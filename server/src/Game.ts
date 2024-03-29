import Engine from '../../common/engine/Engine'
import NetworkServer from './systems/NetworkServer'
import Movement from './systems/Movement'
import WorldComposer from './systems/WorldComposer'
import PopulationManager from './systems/PopulationManager'
import ResourceManager from './systems/ResourceManager'
import ActionCards from './systems/ActionCards'
import Effects from './systems/Effects'
import NpcBehavior from './systems/NpcBehavior'
import Quests from './systems/Quests'
import Chat from './systems/Chat'
import EditorServer from './systems/EditorServer'

export default class Game {
  public engine = new Engine()

  public constructor() {
    this.engine.addSystem(NetworkServer)
    this.engine.addSystem(EditorServer)
    this.engine.addSystem(Chat)
    this.engine.addSystem(WorldComposer)
    this.engine.addSystem(PopulationManager)
    this.engine.addSystem(ResourceManager)
    this.engine.addSystem(NpcBehavior)
    this.engine.addSystem(Quests)
    this.engine.addSystem(ActionCards)
    this.engine.addSystem(Effects)
    this.engine.addSystem(Movement)

    this.engine.start()
  }
}
