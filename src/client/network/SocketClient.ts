import GameState from '../GameState'
import Observable from '../../common/Observable'

export default class SocketClient {
  public onLogin = new Observable<(id: string, props: object) => void>()
  public onDisconnect = new Observable<() => void>()
  public onPlayerJoin = new Observable<(id: string, props: object) => void>()
  public onPlayerLeave = new Observable<(id: string) => void>()
  public onPlayerUpdate = new Observable<(id: string, change: object) => void>()
  public onMobileDie = new Observable<(id: string) => void>()

  private url = `${location.protocol.replace('http', 'ws')}//${location.host}${
    location.pathname
  }`
  private ws?: WebSocket

  public constructor(private state: GameState) {}

  public start() {
    log.out('Socket', 'Init')
    this.connect()
  }

  public connect() {
    this.ws = new WebSocket(this.url)

    this.ws.onopen = () => {
      log.info('Socket', 'connected')
    }

    this.ws.onmessage = (ev) => {
      log.out('Socket', '<-', ev.data)
      const [type, content] = (ev.data as string).split('~')

      if (type === 'IDNT') {
        const [id, name, sprite, x, y] = content.split(',')
        this.onLogin.notify(id, {
          name,
          sprite,
          x: +x,
          y: +y,
        })
      } else if (type === 'JOIN') {
        content.split('|').forEach((change) => {
          const [id, name, sprite, x, y] = change.split(',')

          this.onPlayerJoin.notify(id, {
            name,
            sprite,
            x: +x,
            y: +y,
          })
        })
      } else if (type === 'KILL') {
        this.onMobileDie.notify(content)
      } else if (type === 'EXIT') {
        content.split('|').forEach((id) => {
          this.onPlayerLeave.notify(id)
        })
      } else if (type === 'MOVE') {
        const [id, x, y] = content.split(',')

        this.onPlayerUpdate.notify(id, {
          x: +x,
          y: +y,
        })
      }
    }

    this.ws.onclose = (ev) => {
      log.info('Socket', 'disconnected', ev.code)
      this.onDisconnect.notify()

      if (ev.code === 1000) {
        // Normal closure
        return
      }

      setTimeout(() => {
        log.info('Socket', 'reconnecting...')

        this.connect()
      }, 1000)
    }
  }

  private send(data: string) {
    log.out('Socket', '->', data)
    this.ws?.send(data)
  }

  public sendPosition(x: number, y: number) {
    this.send(`MOVE~${x},${y}`)
  }

  public stop() {
    log.out('Socket', 'Shutdown')
    if (this.ws) {
      this.ws.close(1000)
    }
  }
}
