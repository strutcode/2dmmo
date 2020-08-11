import GameState from './GameState'
import Input from './ui/Input'
import Interface from './ui/Interface'
import Renderer from './graphics/Renderer'
import SocketClient from './network/SocketClient'

export default class GameClient {
  private state = new GameState()
  private renderer = new Renderer(this.state)
  private client = new SocketClient(this.state)
  private input = new Input(this.state)
  private ui = new Interface(this.state)

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

      module.hot.accept('./ui/Interface', async () => {
        this.ui.stop()
        this.ui = new Interface(this.state)
        this.setupUi()
      })
    }
  }

  public async load() {
    await this.renderer.load()

    this.renderer.start()
    this.setupClient()
    this.setupInput()
    this.setupUi()

    this.state.addMobile('abc', {
      sprite: 'deer',
      name: 'A deer',
      x: 1,
      y: 1
    })
  }

  private setupClient() {
    this.client.onLogin.observe((id) => {
      this.state.setSelf(id)
    })

    this.client.onDisconnect.observe(() => {
      this.state = new GameState()
      this.ui.reset()
    })

    this.client.onPlayerJoin.observe((id, props) => {
      this.state.addMobile(id, props)
    })

    this.client.onPlayerLeave.observe((id) => {
      this.state.removeMobile(id)
    })

    this.client.onPlayerUpdate.observe((id, update) => {
      this.state.updateMobile(id, update)
    })

    this.client.start()
  }

  private setupInput() {
    this.input.onAction.observe((name) => {
      if (this.state.self) {
        if (name === 'up') {
          this.state.self.move(0, -1)
        } else if (name === 'down') {
          this.state.self.move(0, 1)
        } else if (name === 'left') {
          this.state.self.move(-1, 0)
        } else if (name === 'right') {
          this.state.self.move(1, 0)
        }

        this.client.sendPosition(this.state.self.x, this.state.self.y)
      }
    })

    this.input.start()
  }

  private setupUi() {
    this.ui.onTriggerInput.observe((name) => {
      this.input.simulate(name)
    })
    this.ui.start()
  }

  public stop() {
    this.renderer.stop()
    this.client.stop()
  }
}
