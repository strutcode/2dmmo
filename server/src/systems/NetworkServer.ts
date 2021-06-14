import System from '../engine/System'
import { Server } from 'ws'
import Protocol, { Packet } from '../../../common/Protocol'
import Entity from '../engine/Entity'

type PendingPacket = {
  entity: Entity
  packet: Packet
}

export default class NetworkServer extends System {
  private pending: PendingPacket[] = []

  start() {
    console.log('Starting network server...')

    const wss = new Server({
      port: 9003,
    })

    wss.on('listening', () => {
      console.log('Server ready on port 9003')
    })

    wss.on('connection', (socket, req) => {
      const ip = req.socket.remoteAddress
      const entity = this.engine.createEntity()

      console.log(`Got connection from ${ip}`)

      socket.on('message', (data) => {
        if (typeof data !== 'string') {
          return
        }

        const packet = Protocol.decode(data)

        console.log(packet)

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
}
