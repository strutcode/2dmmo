import GameState from '../GameState'

export default class SocketClient {
  private ws = new WebSocket(`${location.protocol.replace('http', 'ws')}//${location.host}${location.pathname}`)

  public constructor(private state: GameState) { }

  public start() {
    console.log('start client')
    this.ws.onopen = () => {
      console.log('connected')
    }
  }

  public stop() {
    console.log('stop client')
    this.ws.close()
  }
}
