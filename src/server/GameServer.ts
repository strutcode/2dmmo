import SocketServer from './network/SocketServer'
import WebServer from './network/WebServer'
import Database from './database/Database'

export default class GameServer {
  private webServer = new WebServer()
  private socketServer = new SocketServer(this.webServer)
  private database = new Database()

  public constructor() {
    if (module.hot) {
      log.info('Game', 'Enabling HMR')

      module.hot.accept(
        ['./network/SocketServer', './network/WebServer'],
        () => {
          log.info('Game', 'HMR')

          this.webServer = new (require('./network/WebServer').default)()
          this.socketServer = new (require('./network/SocketServer').default)(
            this.webServer,
          )
        },
      )
    }
  }

  public async init() {
    await this.database.init()

    this.webServer.start()
  }
}
