import System from '../../../common/engine/System'
import Protocol, { Packet } from '../../../common/Protocol'
import CameraFollow from '../components/CameraFollow'
import InputQueue from '../components/InputQueue'
import Sprite from '../components/Sprite'

export default class NetworkClient extends System {
  private socket?: WebSocket

  public start() {
    this.socket = new WebSocket(`${location.origin.replace('http', 'ws')}/data`)

    this.socket.addEventListener('open', () => {
      let pingTime = 0

      this.engine.createEntity([InputQueue, CameraFollow, Sprite])

      setInterval(() => {
        pingTime = performance.now()
        this.send({ type: 'ping' })
      }, 5000)

      this.socket?.addEventListener('message', (msg) => {
        const now = performance.now()
        const packet = Protocol.decode(msg.data)

        if (packet.type === 'ping') {
          console.log(`latency: ${now - pingTime}ms`)
        }
      })
    })
  }

  public update() {
    const queue = this.engine.getComponent(InputQueue)

    if (queue) {
      queue.actions.forEach((action) => {
        this.send({ type: 'input', key: action })
      })
    }
  }

  private send(packet: Packet) {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
      return
    }

    this.socket.send(Protocol.encode(packet))
  }
}
