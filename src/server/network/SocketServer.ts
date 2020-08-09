import WebSocket, { Server } from 'ws'
import WebServer from './WebServer'
import Observable from '../../common/Observable'
import NetworkScope from './NetworkScope'

export default class SocketServer {
  public onConnect = new Observable<(id: string) => void>()
  public onDisconnect = new Observable<(id: string) => void>()

  private wss: Server
  private id2socket = new Map<string, WebSocket>()

  constructor(webServer: WebServer) {
    log.info('Server', 'Init socket server')
    this.wss = new Server({
      server: webServer.httpServer,
    })

    this.wss.on('connection', (socket, request) => {
      log.info(
        'Socket',
        `Accept connection: ${request.connection.remoteAddress}`,
      )

      const uid = (Math.random() * Number.MAX_SAFE_INTEGER)
        .toString(36)
        .substr(2)

      this.id2socket.set(uid, socket)

      this.onConnect.notify(uid)

      socket.on('close', () => {
        this.onDisconnect.notify(uid)
      })
    })
  }

  public addScope(scope: NetworkScope) {
    scope.onChange.observe((id, changes) => {
      log.info('Socket', 'Players changed', id, changes)

      const socket = this.id2socket.get(id)
      if (changes.added.length) {
        socket?.send(`JOIN~${changes.added.map((p) => p.id).join(',')}`)
      }

      if (changes.removed.length) {
        socket?.send(`EXIT~${changes.removed.map((p) => p.id).join(',')}`)
      }
    })

    scope.onUpdate.observe((id, updated) => {
      log.info('Socket', 'Got player update')

      const socket = this.id2socket.get(id)
      socket?.send(`MOVE~${updated.id},${updated.x},${updated.y}`)
    })
  }
}
