import EditorProtocol, { Packet } from '../../../common/EditorProtocol'

type EncodeParams = Parameters<typeof EditorProtocol['encode']>
type DecodeResult = ReturnType<typeof EditorProtocol['decode']>

class Client {
  private socket?: WebSocket
  private inWaiting?: Function
  private queue: EncodeParams[] = []

  public constructor() {
    this.socket = new WebSocket('ws://localhost:9005')

    this.socket.addEventListener('message', (ev) => {
      const data = EditorProtocol.decode(ev.data)

      if (this.inWaiting) {
        this.inWaiting(data)
      }
    })

    this.socket.addEventListener('open', () => {
      this.queue.forEach((args) => {
        this.socket?.send(EditorProtocol.encode(...args))
      })
    })
  }

  public async getQuests() {
    const result = await this.requestReply({
      type: 'listQuests',
    })

    if (result.type !== 'listQuests') {
      throw new Error("You knew this wasn't going to work forever")
    }

    return result.entries
  }

  protected send(...args: EncodeParams) {
    const packet = EditorProtocol.encode(...args)

    if (this.socket?.readyState !== WebSocket.OPEN) {
      this.queue.push(args)
      return
    }

    this.socket.send(packet)
  }

  protected requestReply(...args: EncodeParams): Promise<DecodeResult> {
    this.send(...args)

    return new Promise((resolve) => {
      this.inWaiting = resolve
    })
  }
}

export default new Client()