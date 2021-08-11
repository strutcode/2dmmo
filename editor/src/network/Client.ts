import EditorProtocol, { Packet } from '../../../common/EditorProtocol'

type EncodeParams = Parameters<typeof EditorProtocol['encode']>
type DecodeResult = ReturnType<typeof EditorProtocol['decode']>

class Client {
  public onStatusChange?: (status: string) => void

  private socket?: WebSocket
  private inWaiting?: Function
  private queue: EncodeParams[] = []

  public constructor() {
    const proto = location.protocol.replace('http', 'ws')
    const host = location.host.replace('9004', '9005')
    const path =
      location.hostname === 'localhost'
        ? location.pathname
        : location.pathname + 'data'
    const key = 'pkryvs4ac6481jlsjzy12v0ketxe347ucigv6egekfv1r7cbczudk7c0'

    this.socket = new WebSocket(`${proto}//${host}${path}?k=${key}`)
    this.setStatus('connecting')

    this.socket.addEventListener('message', (ev) => {
      const data = EditorProtocol.decode(ev.data)

      if (this.inWaiting) {
        this.inWaiting(data)
      }
    })

    this.socket.addEventListener('open', () => {
      this.setStatus('connected')

      this.queue.forEach((args) => {
        this.socket?.send(EditorProtocol.encode(...args))
      })
    })

    this.socket.addEventListener('close', () => {
      this.setStatus('disconnected')
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

  public async loadQuest(name: string) {
    const result = await this.requestReply({
      type: 'questContent',
      name,
    })

    if (result.type !== 'questContent') {
      throw new Error("You knew this wasn't going to work forever")
    }

    return result
  }

  protected setStatus(status: string) {
    if (typeof this.onStatusChange === 'function') {
      this.onStatusChange(status)
    }
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
