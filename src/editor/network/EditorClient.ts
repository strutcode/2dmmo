import EditorState from '../EditorState'
import Observable from '../../common/Observable'

export default class EditorClient {
  public onLogin = new Observable<() => void>()
  public onDisconnect = new Observable<() => void>()

  private url = location.href.replace('http', 'ws')
  private ws?: WebSocket

  public constructor(private state: EditorState) {}

  public start() {
    log.out('Socket', 'Init')
    this.connect()
  }

  public connect() {
    this.ws = new WebSocket(this.url)

    this.ws.onopen = () => {
      log.info('Socket', 'connected')
      this.state.connected = true
    }

    this.ws.onmessage = ev => {
      log.out('Socket', '<-', ev.data)
      const [type, content] = (ev.data as string).split('~')
    }

    this.ws.onclose = ev => {
      log.info('Socket', 'disconnected', ev.code)
      this.state.connected = false
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
