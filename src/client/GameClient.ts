import GameState from './GameState'
import Input from './ui/Input'
import Interface from './ui/Interface'
import Renderer from './graphics/Renderer'
import SocketClient from './network/SocketClient'
import Mobile from './entities/Mobile'

export default class GameClient {
  private state = new GameState()
  private renderer = new Renderer(this.state)
  private client = new SocketClient(this.state)
  private input = new Input(this.state)
  private ui = new Interface(this.state)

  public constructor() {
    log.out('Game', 'Init')

    if (module.hot) {
      log.out('Debug', 'Enable HMR')

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
  }

  private setupClient() {
    this.client.onLogin.observe((id, props) => {
      this.state.setSelf(id, props)
    })

    this.client.onDisconnect.observe(() => {
      this.state.reset()
      this.ui.reset()
    })

    this.client.onMobileAdd.observe((id, props) => {
      this.state.addMobile(id, props)
    })

    this.client.onMobileRemove.observe((id) => {
      this.state.removeMobile(id)
    })

    this.client.onMobileUpdate.observe((id, update) => {
      this.state.updateMobile(id, update)
    })

    this.client.onMobileHit.observe((info) => {
      const { attackerId, defenderId, amount } = info
      const attacker = this.state.mobs.get(attackerId)
      const defender = this.state.mobs.get(defenderId)

      if (attacker && defender) {
        attacker.action = 'attack'
        defender.action = 'hit'
        this.renderer.mobileHit(attacker, defender, amount)
      }
    })

    this.client.start()
  }

  private setupInput() {
    this.input.onAction.observe((name) => {
      if (this.state.self) {
        let newX = this.state.self.x
        let newY = this.state.self.y

        if (name === 'up') {
          newY--
        } else if (name === 'down') {
          newY++
        } else if (name === 'left') {
          newX--
        } else if (name === 'right') {
          newX++
        }

        this.client.sendPosition(newX, newY)

        const mob = Mobile.firstAt(newX, newY)
        if (mob) {
          mob.bump(this.state.self)
        } else {
          this.state.self.teleport(newX, newY)
        }
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
    log.out('Game', 'Shutdown')
    this.renderer.stop()
    this.client.stop()
  }
}
