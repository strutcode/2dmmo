import Renderer from './graphics/Renderer'
import SocketClient from './network/SocketClient'
import GameState from './GameState'

export default class GameClient {
  private state = new GameState()
  private renderer = new Renderer(this.state)
  private client = new SocketClient(this.state)

  public constructor() {
    console.log('init client')

    if (module.hot) {
      console.log('enable hmr for graphics')
      module.hot.accept('./graphics/Renderer', async () => {
        this.renderer.stop()
        this.renderer = new Renderer(this.state)
        await this.renderer.load()
        this.renderer.start()
      })
    }
  }

  public async load() {
    await this.renderer.load()

    this.renderer.start()
    this.client.start()
  }

  public stop() {
    this.renderer.stop()
    this.client.stop()
  }
}
