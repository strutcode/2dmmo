import EditorProtocol from '../../../common/EditorProtocol'

type EncodeParams = Parameters<typeof EditorProtocol['encode']>
type DecodeResult = ReturnType<typeof EditorProtocol['decode']>

export default class Client {
  private socket?: WebSocket
  private inWaiting?: Function

  public constructor() {
    this.socket = new WebSocket('ws://localhost:9005')

    this.socket.addEventListener('message', (ev) => {
      const data = EditorProtocol.decode(ev.data)

      if (this.inWaiting) {
        this.inWaiting(data)
      }
    })

    this.socket.addEventListener('open', () => {
      this.getQuests().then((q) => console.log(q))
    })
  }

  public async getQuests() {
    return this.requestReply({
      type: 'listQuests',
    })
  }

  protected send(...args: EncodeParams) {
    if (this.socket?.readyState !== WebSocket.OPEN) {
      return
    }

    this.socket.send(EditorProtocol.encode(...args))
  }

  protected requestReply(...args: EncodeParams): Promise<DecodeResult> {
    this.send(...args)

    return new Promise((resolve) => {
      this.inWaiting = resolve
    })
  }
}
