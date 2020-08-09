import GameState from '../GameState'

export default class SocketClient {
  private url = `${location.protocol.replace('http', 'ws')}//${location.host}${
    location.pathname
  }`
  private ws?: WebSocket

  public constructor(private state: GameState) {}

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
    }

    this.ws.onclose = () => {
      console.log('disconnected')

      setTimeout(() => {
        console.log('reconnecting...')

        this.connect()
      }, 1000)
    }
  }

  public stop() {
    console.log('stop client')
    if (this.ws) {
      this.ws.close()
    }
  }
}
