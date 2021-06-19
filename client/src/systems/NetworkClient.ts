import System from '../../../common/engine/System'
import Protocol, { Packet } from '../../../common/Protocol'
import CameraFollow from '../components/CameraFollow'
import InputQueue from '../components/InputQueue'
import LatencyGraph from '../components/LatencyGraph'
import Sprite from '../components/Sprite'

export default class NetworkClient extends System {
  private localId?: number
  private socket?: WebSocket

  public start() {
    this.socket = new WebSocket(`${location.origin.replace('http', 'ws')}/data`)

    this.socket.addEventListener('open', () => {
      let pingTime = 0

      setInterval(() => {
        pingTime = performance.now()
        this.send({ type: 'ping' })
      }, 500)

      this.socket?.addEventListener('message', (msg) => {
        const now = performance.now()
        const packet = Protocol.decode(msg.data)

        if (packet.type === 'ping') {
          const graph = this.engine.getComponent(LatencyGraph)

          graph?.logLatency(now - pingTime)
        } else if (packet.type === 'authorize') {
          this.localId = packet.id
          this.engine.createEntity([InputQueue, CameraFollow, Sprite])
          console.log(`Connected as player ${packet.id}`)
        } else if (packet.type === 'spawn') {
          if (packet.id === this.localId) return

          this.engine.createEntity([Sprite])
        } else if (packet.type === 'move') {
          const entity = this.engine.getEntity(packet.id)

          if (entity) {
            const visual = entity.getComponent(Sprite)

            if (visual) {
              visual.x = packet.x * 16
              visual.y = packet.y * 16
            }
          }
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
