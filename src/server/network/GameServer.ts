import SocketServer from './SocketServer'
import WebServer from './WebServer'

export default class GameServer {
  private webServer = new WebServer()
  private socketServer = new SocketServer(this.webServer)

  public constructor() {
    this.webServer.start()

    if (module.hot) {
      log.info('Enabling HMR')

      module.hot.accept(['./SocketServer', './WebServer'], () => {
        log.info('HMR')

        this.webServer = new (require('./WebServer').default)()
        this.socketServer = new (require('./SocketServer').default)(
          this.webServer,
        )
      })
    }
  }
}
