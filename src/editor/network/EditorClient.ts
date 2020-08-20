import EditorState from '../EditorState'
import Observable from '../../common/Observable'

export default class EditorClient {
  public onConnect = new Observable<() => void>()
  public onDisconnect = new Observable<() => void>()

  private url = location.href.replace('http', 'ws')
  private ws?: WebSocket

  public constructor(private state: EditorState) {
    state.onRequestData.observe((type, params) => {
      this.requestData(type, params)
    })
  }

  public start() {
    log.out('Socket', 'Init')
    this.connect()
  }

  public connect() {
    this.ws = new WebSocket(this.url)

    this.ws.onopen = () => {
      log.info('Socket', 'connected')
      this.state.connected = true
      this.onConnect.notify()
    }

    this.ws.onmessage = ev => {
      log.out('Socket', '<-', ev.data)

      if (ev.data.substr(0, 4) === 'NENT') {
        location.href = location.origin
        return
      }
      if (ev.data.substr(0, 4) === 'WZRD') {
        // Meant for the client to redirect
        return
      }

      const data = JSON.parse(ev.data)
      this.state.receiveData(data.type, data.params)
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

  private requestData(type: string, params: any) {
    this.send('WZRD~' + JSON.stringify({ type, params }))
  }

  private send(data: string) {
    log.out('Socket', '->', data)
    this.ws?.send(data)
  }

  public stop() {
    log.out('Socket', 'Shutdown')
    if (this.ws) {
      this.ws.close(1000)
    }
  }
}
