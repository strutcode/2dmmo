import WebSocket, { Server } from 'ws'

import NetworkScope from './NetworkScope'
import Observable from '../../common/Observable'
import WebServer from './WebServer'
import Player from '../entities/Player'

export default class SocketServer {
  public onConnect = new Observable<(id: string) => void>()
  public onMessage = new Observable<
    (id: string, type: string, data: any) => void
  >()
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

      socket.on('message', (data) => {
        if (typeof data === 'string') {
          const [type, content] = data.split('~')

          if (type === 'MOVE') {
            const [x, y] = content.split(',')

            this.onMessage.notify(uid, 'move', {
              x: +x,
              y: +y,
            })
          }
        }
      })

      socket.on('close', () => {
        this.onDisconnect.notify(uid)
      })
    })
  }

  public addScope(scope: NetworkScope) {
    scope.onChange.observe((id, changes) => {
      const socket = this.id2socket.get(id)

      if (!socket) return

      if (changes.added) {
        socket?.send(
          `JOIN~${changes.added
            .map((m) => `${m.id},${m.name},${m.sprite},${m.x},${m.y}`)
            .join('|')}`,
        )
      }

      if (changes.updated) {
        const socket = this.id2socket.get(id)
        changes.updated.forEach((m) => {
          socket?.send(`MOVE~${m.id},${m.x},${m.y}`)
        })
      }

      if (changes.removed) {
        socket?.send(`EXIT~${changes.removed.map((m) => m.id).join('|')}`)
      }
    })

    scope.onKill.observe((id, mob) => {
      const socket = this.id2socket.get(id)

      if (!socket) return

      socket.send(`KILL~${mob.id}`)
    })
  }

  public sendLogin(player: Player) {
    const socket = this.id2socket.get(player.id)

    if (socket) {
      socket.send(
        `IDNT~${player.id},${player.name},${player.sprite},${player.x},${player.y}`,
      )
    }
  }
}
