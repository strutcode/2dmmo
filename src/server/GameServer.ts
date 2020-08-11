import Database from './database/Database'
import Mobile from './entities/Mobile'
import NetworkScope from './network/NetworkScope'
import Player from './entities/Player'
import SocketServer from './network/SocketServer'
import WebServer from './network/WebServer'

export default class GameServer {
  private webServer = new WebServer()
  private socketServer = new SocketServer(this.webServer)
  private database = new Database()
  private players = new Map<string, Player>()
  private globalScope = new NetworkScope()

  // public constructor() {
  //   if (module.hot) {
  //     log.info('Game', 'Enabling HMR')

  //     module.hot.accept(
  //       ['./network/SocketServer', './network/WebServer'],
  //       () => {
  //         log.info('Game', 'HMR')

  //         this.webServer = new (require('./network/WebServer').default)()
  //         this.socketServer = new (require('./network/SocketServer').default)(
  //           this.webServer,
  //         )
  //       },
  //     )
  //   }
  // }

  public async init() {
    await this.database.init()

    this.socketServer.addScope(this.globalScope)

    this.socketServer.onConnect.observe((id) => {
      const player = new Player(id)
      log.info('Game', `Player created: ${id}`)

      this.players.set(id, player)
      this.globalScope.addMobile(player)
    })

    this.socketServer.onMessage.observe((id, type, data) => {
      if (type === 'move') {
        const player = this.players.get(id)

        if (player) {
          player.teleport(data.x, data.y)
        }
      }
    })

    this.socketServer.onDisconnect.observe((id) => {
      const player = this.players.get(id)

      if (player) {
        log.info('Game', `Player destroyed: ${player.name} (${player.id})`)
        this.players.delete(id)
        this.globalScope.removeMobile(player)
      } else {
        log.error('Game', `Non-existent player disconnected: ${id}`)
      }
    })

    const allDeer = []
    let id = 0

    setInterval(() => {
      if (allDeer.length > 10) return

      const deer = new Mobile(`deer_${id++}`, {
        name: 'A deer',
        sprite: 'deer',
        x: Math.floor(Math.random() * 20 - 10),
        y: Math.floor(Math.random() * 20 - 10),
      })

      this.globalScope.addMobile(deer)

      setInterval(() => {
        let x = Math.round(Math.random() * 2 + 1 - 2)
        let y = Math.round(Math.random() * 2 + 1 - 2)

        if (deer.x < -10) x = 1
        if (deer.x > 10) x = -1

        if (deer.y < -10) y = 1
        if (deer.y > 10) y = -1

        if (x !== 0 && y !== 0) {
          if (Math.random() < 0.5) x = 0
          else y = 0
        }

        if (x === 0 && y === 0) {
          return
        }

        deer.move(x, y)
      }, 5000)

      allDeer.push(deer)
    }, 10000)

    this.webServer.start()
  }
}
