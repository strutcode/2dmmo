import Renderer from './graphics/Renderer'
import SocketClient from './network/SocketClient'
import GameState from './GameState'
import Input from './ui/Input'

export default class GameClient {
  private state = new GameState()
  private renderer = new Renderer(this.state)
  private client = new SocketClient(this.state)
  private input = new Input(this.state)

  public constructor() {
    console.log('init client')

    if (module.hot) {
      console.log('enable hmr')

      module.hot.accept('./graphics/Renderer', async () => {
        this.renderer.stop()
        this.renderer = new Renderer(this.state)
        await this.renderer.load()
        this.renderer.start()
      })

      module.hot.accept('./network/SocketClient', async () => {
        this.client.stop()
        this.client = new SocketClient(this.state)
        this.setupClient()
      })

      module.hot.accept('./ui/Input', async () => {
        this.input.stop()
        this.input = new Input(this.state)
        this.setupInput()
      })
    }
  }

  public async load() {
    await this.renderer.load()

    this.renderer.start()
    this.setupClient()
    this.setupInput()
  }

  private setupClient() {
    this.client.onLogin.observe((id) => {
      this.state.setSelf(id)
    })

    this.client.onPlayerJoin.observe((id, props) => {
      this.state.addPlayer(id, props)
    })

    this.client.onPlayerLeave.observe((id) => {
      this.state.removePlayer(id)
    })

    this.client.onPlayerUpdate.observe((id, update) => {
      this.state.updatePlayer(id, update)
    })

    this.client.start()
  }

  private setupInput() {
    this.input.onAction.observe((name) => {
      if (this.state.self) {
        if (name === 'up') {
          this.state.self.y--
        } else if (name === 'down') {
          this.state.self.y++
        } else if (name === 'left') {
          this.state.self.x--
        } else if (name === 'right') {
          this.state.self.x++
        }

        this.client.sendPosition(this.state.self.x, this.state.self.y)
      }
    })

    this.input.start()
  }

  public stop() {
    this.renderer.stop()
    this.client.stop()
  }
}
