import { Server } from 'ws'
import WebServer from './WebServer'

export default class SocketServer {
  private wss: Server

  constructor(webServer: WebServer) {
    log.info('Server', 'Init socket server')
    this.wss = new Server({
      server: webServer.httpServer,
    })
  }
}
