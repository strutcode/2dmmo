import GameState from '../GameState'
import Observable from '../../common/Observable'

export default class SocketClient {
  public onLogin = new Observable<(id: string) => void>()
  public onDisconnect = new Observable<() => void>()
  public onPlayerJoin = new Observable<(id: string, props: object) => void>()
  public onPlayerLeave = new Observable<(id: string) => void>()
  public onPlayerUpdate = new Observable<(id: string, change: object) => void>()

  private url = `${location.protocol.replace('http', 'ws')}//${location.host}${
    location.pathname
    }`
  private ws?: WebSocket

  public constructor(private state: GameState) { }

  public start() {
    console.log('start client')
    this.connect()
  }

  public connect() {
    this.ws = new WebSocket(this.url)

    this.ws.onopen = () => {
      console.log('connected')
    }

    this.ws.onmessage = (ev) => {
      console.log(ev.data)
      const [type, content] = (ev.data as string).split('~')

      if (type === 'IDNT') {
        this.onLogin.notify(content)
      } else if (type === 'JOIN') {
        content.split('|').forEach((change) => {
          const [id, x, y] = change.split(',')
          this.onPlayerJoin.notify(id, {
            x: +x,
            y: +y,
          })
        })
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
      console.log('disconnected', ev.code)
      this.onDisconnect.notify()

      if (ev.code === 1000) {
        // Normal closure
        return
      }

      setTimeout(() => {
        console.log('reconnecting...')

        this.connect()
      }, 1000)
    }
  }

  public sendPosition(x: number, y: number) {
    this.ws?.send(`MOVE~${x},${y}`)
  }

  public stop() {
    console.log('stop client')
    if (this.ws) {
      this.ws.close(1000)
    }
  }
}
