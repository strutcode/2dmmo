import Engine from '../../common/engine/Engine'
import LatencyGraph from './components/LatencyGraph'
import Input from './systems/Input'
import NetworkClient from './systems/NetworkClient'
import Renderer2d from './systems/Renderer2d'

export default class Game {
  public engine = new Engine()

  public constructor() {
    this.engine.addSystem(NetworkClient)
    this.engine.addSystem(Renderer2d)
    this.engine.addSystem(Input)

    this.engine.createEntity({
      id: Number.MAX_SAFE_INTEGER,
      components: [LatencyGraph],
    })

    this.engine.start()
  }
}
