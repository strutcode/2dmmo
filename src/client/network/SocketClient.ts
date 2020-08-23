import GameState from '../GameState'
import Observable from '../../common/Observable'

interface HitInfo {
  attackerId: string
  defenderId: string
  amount: number
}

export default class SocketClient {
  public onConnect = new Observable<() => void>()
  public onLogin = new Observable<(id: string, props: object) => void>()
  public onDisconnect = new Observable<() => void>()
  public onMobileAdd = new Observable<(id: string, props: object) => void>()
  public onMobileRemove = new Observable<(id: string) => void>()
  public onMobileUpdate = new Observable<(id: string, change: object) => void>()
  public onMobileHit = new Observable<(info: HitInfo) => void>()

  private url = location.href.replace('http', 'ws')
  private ws?: WebSocket

  public constructor(private state: GameState) {}

  public start() {
    log.out('Network', 'Init')
    this.connect()
  }

  public connect() {
    this.ws = new WebSocket(this.url)

    this.ws.onopen = () => {
      log.info('Network', 'Connected')
      this.onConnect.notify()
    }

    this.ws.onmessage = ev => {
      log.out('Socket', '<-', ev.data)
      const [type, content] = (ev.data as string).split('~')

      if (type === 'WZRD') {
        location.href = `${location.origin}/editor`
      } else if (type === 'IDNT') {
        const [id, name, sprite, x, y] = content.split(',')

        log.info('Network', `Logged in as ${name}`)

        this.onLogin.notify(id, {
          name,
          sprite,
          x: +x,
          y: +y,
        })
      } else if (type === 'JOIN') {
        content.split('|').forEach(change => {
          const [id, name, sprite, x, y, hp] = change.split(',')

          this.onMobileAdd.notify(id, {
            name,
            sprite,
            x: +x,
            y: +y,
            hp: +hp,
          })
        })
      } else if (type === 'EXIT') {
        content.split('|').forEach(id => {
          this.onMobileRemove.notify(id)
        })
      } else if (type === 'INFO') {
        const [id, x, y, alive] = content.split(',')

        this.onMobileUpdate.notify(id, {
          x: +x,
          y: +y,
          kill: !+alive,
        })
      } else if (type === 'HURT') {
        const [attackerId, defenderId, amount] = content.split(',')
        this.onMobileHit.notify({
          attackerId,
          defenderId,
          amount: +amount,
        })
      }
    }

    this.ws.onclose = ev => {
      log.info('Network', `Disconnected (${ev.code})`)
      this.onDisconnect.notify()

      if (ev.code === 1000) {
        // Normal closure
        return
      }

      setTimeout(() => {
        log.info('Network', 'Reconnecting...')

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
    log.out('Network', 'Shutdown')
    if (this.ws) {
      this.ws.close(1000)
    }
  }
}
