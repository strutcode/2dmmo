import System from '../../../common/engine/System'
import WebSocket, { Server } from 'ws'
import Protocol, { Packet } from '../../../common/Protocol'
import Entity from '../../../common/engine/Entity'
import TilePosition from '../components/TilePosition'
import Input from '../components/Input'
import { openSync, readFileSync, readSync } from 'fs'

type PendingPacket = {
  entity: Entity
  packet: Packet
}

export default class NetworkServer extends System {
  private wss?: Server
  private pending: PendingPacket[] = []

  public start() {
    console.log('Starting network server...')

    this.wss = new Server({
      port: 9003,
    })

    this.wss.on('listening', () => {
      console.log('Server ready on port 9003')
    })

    this.wss.on('connection', (socket, req) => {
      const ip = req.socket.remoteAddress
      const entity = this.engine.createEntity([Input, TilePosition])

      console.log(`Got connection from ${ip}`)

      socket.send(Protocol.encode({ type: 'authorize', id: entity.id }))
      console.log(`Player ${entity.id} joined`)

      this.engine.getAllComponents(TilePosition).forEach((pos) => {
        socket.send(
          Protocol.encode({
            type: 'spawn',
            id: pos.entity.id,
            x: pos.x,
            y: pos.y,
          }),
        )
      })

      this.broadcast({
        type: 'spawn',
        id: entity.id,
        x: 0,
        y: 0,
      })

      this.sendImage(
        socket,
        'default',
        'HAS Overworld 2.0/GrassBiome/GB-LandTileset.png',
      )

      socket.on('message', (data) => {
        if (typeof data !== 'string') {
          return
        }

        const packet = Protocol.decode(data)

        if (packet.type === 'ping') {
          socket.send(Protocol.encode({ type: 'ping' }))
          return
        }

        this.pending.push({
          entity,
          packet,
        })
      })

      socket.on('close', () => {
        console.log(`Lost connection from ${ip}`)

        this.broadcast({ type: 'despawn', id: entity.id })
        this.engine.destroyEntity(entity)
        console.log(`Player ${entity.id} left`)
      })
    })
  }

  public update() {
    this.pending.forEach(({ entity, packet }) => {
      if (packet.type === 'input') {
        const input = entity.getComponent(Input)

        if (input) {
          input.addInput(packet.key)
        }
      }
    })

    this.pending = []

    this.engine.getAllComponents(TilePosition).forEach((pos) => {
      if (pos.dirty) {
        this.broadcast({
          type: 'move',
          id: pos.entity.id,
          x: pos.x,
          y: pos.y,
        })
        pos.dirty = false
      }
    })
  }

  public broadcast(packet: Packet) {
    this.wss?.clients.forEach((client) => {
      client.send(Protocol.encode(packet))
    })
  }

  public sendImage(socket: WebSocket, name: string, filename: string) {
    const data = readFileSync(`../assets/${filename}`, {
      encoding: 'base64',
    })

    socket.send(Protocol.encode({ type: 'image', name, data }))
  }
}
