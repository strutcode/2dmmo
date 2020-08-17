import WebSocket, { Server } from 'ws'

import NetworkScope from './NetworkScope'
import Observable from '../../common/Observable'
import WebServer from './WebServer'
import Uid from '../util/Uid'
import Wizard from '../entities/Wizard'
import Player from '../entities/Player'
import Authentication from './Authentication'
import cookieParser from 'cookie-parser'

export default class SocketServer {
  public onConnect = new Observable<(id: string) => void>()
  public onAuth = new Observable<(id: string, jwt: string) => void>()
  public onMessage = new Observable<
    (id: string, type: string, data: any) => void
  >()
  public onDisconnect = new Observable<(id: string) => void>()

  private wss: Server
  private connection = 0
  private token2socket = new Map<string, WebSocket>()
  private id2socket = new Map<string, WebSocket>()

  constructor(webServer: WebServer) {
    log.info('Network', 'Init socket server')

    this.wss = new Server({
      server: webServer.httpServer,
    })

    this.wss.on('connection', (socket, request) => {
      log.info(
        'Socket',
        `Accept connection: ${request.connection.remoteAddress}`,
      )
      const token = Uid.from(this.connection++)
      this.token2socket.set(token, socket)
      this.onConnect.notify(token)

      try {
        const cookies = (request.headers.cookie || '')
          .split(';')
          .map(s => s.trim())
          .reduce((acc, cookie) => {
            const [key, ...rest] = cookie.split('=')

            acc[key] = rest.join('=')

            return acc
          }, {} as Record<string, string>)

        const authCookie = cookies['auth']
        const jwt = Authentication.verifyToken(authCookie)

        log.out('Socket', `Auth handshake: ${token}`)
        this.onAuth.notify(token, jwt.sub)
      } catch (e) {
        log.out('Socket', 'Failed authentication')
        socket.close()
        return
      }
    })
  }

  public wizardData(id: string, type: string, params: any) {
    const socket = this.id2socket.get(id)

    if (socket) {
      socket.send(JSON.stringify({ type, params }))
    }
  }

  public authResponse(token: string, client: Player | Wizard | undefined) {
    log.out('Socket', `Auth response: ${token}`)

    if (client) {
      log.out('Socket', `Got client: ${client.id}`)
      const socket = this.token2socket.get(token)

      if (socket) {
        // Convert the authentication token to an id assignment
        this.id2socket.set(client.id, socket)
        this.token2socket.delete(client.id)

        socket.on('message', data => {
          if (typeof data === 'string') {
            const type = data.substr(0, 4)
            const content = data.substr(5)

            if (type === 'MOVE') {
              const [x, y] = content.split(',')

              this.onMessage.notify(client.id, 'move', {
                x: +x,
                y: +y,
              })
            } else if (type === 'WZRD') {
              this.onMessage.notify(client.id, 'wizard', JSON.parse(content))
            } else {
              log.warn('Socket', `Invalid message type: ${type}`)
            }
          }
        })

        socket.on('close', () => {
          this.onDisconnect.notify(client.id)
        })

        if (client instanceof Player) {
          socket.send(
            `IDNT~${client.id},${client.name},${client.sprite},${client.x},${client.y}`,
          )
        }
      }
    }
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
}
