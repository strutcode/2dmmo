import GameState from '../GameState'

export default class SocketClient {
  private ws = new WebSocket(`ws://${location.host}`)

  public constructor(private state: GameState) {}

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
