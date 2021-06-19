import System from '../../../common/engine/System'
import { Server } from 'ws'
import Protocol, { Packet } from '../../../common/Protocol'
import Entity from '../../../common/engine/Entity'
import TilePosition from '../components/TilePosition'
import Input from '../components/Input'

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
      const entity = this.engine.createEntity([Input, TilePosition])

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
      const input = entity.getComponent(Input)

      if (input) {
        input.addInput(packet.key)
      }
    })

    this.pending = []
  }
}
