import Engine from '../../common/engine/Engine'
import CardData from './components/CardData'
import ChatData from './components/ChatData'
import LatencyGraph from './components/LatencyGraph'
import SpriteLoadQueue from './components/SpriteLoadQueue'
import TileMap from './components/TileMap'
import Cards from './systems/Cards'
import Chat from './systems/Chat'
import Input from './systems/Input'
import NetworkClient from './systems/NetworkClient'
import Renderer2d from './systems/Renderer2d'
import Trade from './systems/Trade'

export default class Game {
  public engine = new Engine()

  public constructor() {
    ;(window as any).engine = this.engine

    this.engine.addSystem(NetworkClient)
    this.engine.addSystem(Renderer2d)
    this.engine.addSystem(Chat)
    this.engine.addSystem(Cards)
    this.engine.addSystem(Input)
    this.engine.addSystem(Trade)

    // Create a hack entity for global components
    this.engine.createEntity({
      id: Number.MAX_SAFE_INTEGER, // To avoid collisions
      components: [LatencyGraph, SpriteLoadQueue, TileMap, ChatData, CardData],
    })

    this.engine.start()
  }
}
