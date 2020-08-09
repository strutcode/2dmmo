import SocketServer from './network/SocketServer'
import WebServer from './network/WebServer'
import Database from './database/Database'
import Player from './entities/Player'
import NetworkScope from './network/NetworkScope'

export default class GameServer {
  private webServer = new WebServer()
  private socketServer = new SocketServer(this.webServer)
  private database = new Database()
  private players: Player[] = []
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

      this.players.push(player)
      this.globalScope.addPlayer(player)
    })

    this.socketServer.onMessage.observe((id, type, data) => {
      if (type === 'move') {
        const player = this.players.find((p) => p.id === id)

        if (player) {
          player.teleport(data.x, data.y)
        }
      }
    })

    this.socketServer.onDisconnect.observe((id) => {
      const index = this.players.findIndex((p) => p.id === id)
      const player = this.players[index]
      log.info('Game', `Player destroyed: ${id}`)

      this.players.splice(index, 1)
      this.globalScope.removePlayer(player)
    })

    this.webServer.start()
  }
}
