import WebSocket, { Server } from 'ws'

import NetworkScope from './NetworkScope'
import Observable from '../../common/Observable'
import WebServer from './WebServer'
import Player from '../entities/Player'

export default class SocketServer {
  public onConnect = new Observable<(id: string) => void>()
  public onAuth = new Observable<(id: string, authString: string) => void>()
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
      this.onAuth.notify(uid, request.url?.replace(/^.*?\?/, '') || '')

      socket.on('message', data => {
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
            .map(m => `${m.id},${m.name},${m.sprite},${m.x},${m.y}`)
            .join('|')}`,
        )
      }

      if (changes.updated) {
        changes.updated.forEach(m => {
          socket?.send(`INFO~${m.id},${m.x},${m.y},${m.hp > 0 ? 1 : 0}`)
        })
      }

      if (changes.removed) {
        socket?.send(`EXIT~${changes.removed.map(m => m.id).join('|')}`)
      }
    })

    scope.onAction.observe((id, type, props) => {
      const socket = this.id2socket.get(id)

      if (!socket) return

      switch (type) {
        case 'hurt':
          socket.send(
            `HURT~${props.attacker.id},${props.defender.id},${props.amount}`,
          )
          break
      }
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
