import System from '../../../common/engine/System'
import WebSocket, { Server } from 'ws'
import Protocol, { Packet } from '../../../common/Protocol'
import Entity from '../../../common/engine/Entity'
import TilePosition from '../components/TilePosition'
import Input from '../components/Input'
import { readFileSync } from 'fs'

type PendingPacket = {
  entity: Entity
  packet: Packet
}

/** This system handles all network communication queued up by other systems */
export default class NetworkServer extends System {
  private wss?: Server
  private pending: PendingPacket[] = []

  public start() {
    // Init server
    console.log('Starting network server...')
    this.wss = new Server({
      port: 9003,
    })

    // Logging
    this.wss.on('listening', () => {
      console.log('Server ready on port 9003')
    })

    // When a player connects...
    this.wss.on('connection', (socket, req) => {
      const ip = req.socket.remoteAddress
      const entity = this.engine.createEntity([Input, TilePosition])

      console.log(`Got connection from ${ip}`)

      // Send intialization packet
      socket.send(Protocol.encode({ type: 'authorize', id: entity.id }))
      console.log(`Player ${entity.id} joined`)

      // Sync all existing entities
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

      // Sync the new player to others
      this.broadcast({
        type: 'spawn',
        id: entity.id,
        x: 0,
        y: 0,
      })

      // Always send basic resources for now
      this.sendImage(
        socket,
        'tilemap/grass',
        'HAS Overworld 2.0/GrassBiome/GB-LandTileset.png',
      )
      this.sendImage(
        socket,
        'creatures/castle',
        'HAS Creature Pack/Castle/Castle(AllFrame).png',
      )

      // When the client sends data...
      socket.on('message', (data) => {
        // Safety check
        if (typeof data !== 'string') {
          return
        }

        // Get the decoded data
        const packet = Protocol.decode(data)

        // Early out for ping/pong
        if (packet.type === 'ping') {
          socket.send(Protocol.encode({ type: 'ping' }))
          return
        }

        // Add the packet to the processing queue
        this.pending.push({
          entity,
          packet,
        })
      })

      // When the player disconnects
      socket.on('close', () => {
        console.log(`Lost connection from ${ip}`)

        // Notify others
        this.broadcast({ type: 'despawn', id: entity.id })

        // Remove resources
        this.engine.destroyEntity(entity)

        console.log(`Player ${entity.id} left`)
      })
    })
  }

  public update() {
    // Process input packets
    this.pending.forEach(({ entity, packet }, i) => {
      if (packet.type === 'input') {
        const input = entity.getComponent(Input)

        if (input) {
          input.addInput(packet.key)
        }

        // Remove the processed packet
        this.pending.splice(i, 1)
      }
    })

    // Check if any entities moved
    this.engine.getAllComponents(TilePosition).forEach((pos) => {
      // If so, sync their position
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

  /** Sends a message to all connected clients */
  public broadcast(packet: Packet) {
    this.wss?.clients.forEach((client) => {
      client.send(Protocol.encode(packet))
    })
  }

  /**
   * Sends image data over the socket to a player
   *
   * @param socket The destination
   * @param name The asset identifier
   * @param filename The location on disk
   */
  public sendImage(socket: WebSocket, name: string, filename: string) {
    // Read as base64
    const data = readFileSync(`../assets/${filename}`, {
      encoding: 'base64',
    })

    // Encode to a packet
    socket.send(Protocol.encode({ type: 'image', name, data }))
  }
}
