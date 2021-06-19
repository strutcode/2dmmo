import System from '../../../common/engine/System'
import { Server } from 'ws'
import Protocol, { Packet } from '../../../common/Protocol'
import Entity from '../../../common/engine/Entity'
import TilePosition from '../components/TilePosition'

type PendingPacket = {
  entity: Entity
  packet: Packet
}

export default class NetworkServer extends System {
  private pending: PendingPacket[] = []

  public start() {
    console.log('Starting network server...')

    const wss = new Server({
      port: 9003,
    })

    wss.on('listening', () => {
      console.log('Server ready on port 9003')
    })

    wss.on('connection', (socket, req) => {
      const ip = req.socket.remoteAddress
      const entity = this.engine.createEntity([
        TilePosition
      ])

      console.log(`Got connection from ${ip}`)
      console.log(`Player ${entity.id} joined`)

      socket.on('message', (data) => {
        if (typeof data !== 'string') {
          return
        }

        const packet = Protocol.decode(data)

        this.pending.push({
          entity,
          packet,
        })
      })

      socket.on('close', () => {
        console.log(`Lost connection from ${ip}`)
      })
    })
  }

  public update() {
    this.pending.forEach(({ entity, packet }) => {
      const pos = entity.getComponent(TilePosition)

      if (pos) {
        if (packet.key === 'up') {
          pos.moveIntentY = -1
        } else if (packet.key === 'down') {
          pos.moveIntentY = 1
        } else if (packet.key === 'left') {
          pos.moveIntentX = -1
        } else if (packet.key === 'right') {
          pos.moveIntentX = 1
        }
      }
    })

    this.pending = []
  }
}
