import System from '../../../common/engine/System'
import WebSocket, { Server } from 'ws'
import Protocol, { Packet } from '../../../common/Protocol'
import Entity from '../../../common/engine/Entity'
import TilePosition from '../components/TilePosition'
import Input from '../components/Input'
import { readFileSync } from 'fs'
import TileVisibility from '../components/TileVisibility'
import { TileMapChunk } from '../util/MapLoader'
import Mobile from '../components/Mobile'

type PendingPacket = {
  entity: Entity
  packet: Packet
}

type MobData = {}

/** This system handles all network communication queued up by other systems */
export default class NetworkServer extends System {
  /** The main socket server */
  private wss?: Server
  /** A queue of pending network packets */
  private pending: PendingPacket[] = []
  /** A map of entities to their communication sockets */
  private clientMap = new Map<Entity, WebSocket>()
  /** Registered mobs */
  private mobileMap = new Map<Entity, MobData>()

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
    this.wss.on('connection', async (socket, req) => {
      const ip = req.socket.remoteAddress

      console.log(`Got connection from ${ip}`)

      const handshake = await this.getHandshake(socket)
      const name = handshake.name

      // Create the entity for tracking
      const entity = this.engine.createEntity([
        Input,
        Mobile,
        TilePosition,
        TileVisibility,
      ])

      // Update components
      const meta = entity.getComponent(Mobile)
      if (meta) {
        meta.name = name
      }

      // Register the entity
      this.mobileMap.set(entity, {})

      // Register the socket
      this.clientMap.set(entity, socket)

      // Send intialization packet
      socket.send(Protocol.encode({ type: 'authorize', id: entity.id }))
      console.log(`Player '${name}' joined`)

      // Sync all existing entities
      this.engine.getAllComponents(TilePosition).forEach((pos) => {
        const meta = pos.entity.getComponent(Mobile)

        socket.send(
          Protocol.encode({
            type: 'spawn',
            id: pos.entity.id,
            name: meta?.name ?? 'Soandso',
            sprite: meta?.sprite ?? 'swordman',
            x: pos.x,
            y: pos.y,
          }),
        )
      })

      // Sync the new player to others
      this.broadcast({
        type: 'spawn',
        id: entity.id,
        name,
        sprite: meta?.sprite ?? 'swordman',
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
      this.sendImage(
        socket,
        'creatures/rampart',
        'HAS Creature Pack/Rampart/Rampart(AllFrame).png',
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

        // Unregister the socket
        this.clientMap.delete(entity)

        // Remove resources
        this.engine.destroyEntity(entity)

        console.log(`Player ${name} left`)
      })
    })
  }

  public update() {
    // Sync mobs
    this.engine.getAllComponents(Mobile).forEach((mob) => {
      if (!this.mobileMap.has(mob.entity)) {
        const pos = mob.entity.getComponent(TilePosition)

        this.broadcast({
          type: 'spawn',
          id: mob.entity.id,
          name: mob.name,
          sprite: mob.sprite,
          x: pos?.x ?? 0,
          y: pos?.y ?? 0,
        })
      }
    })
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

    // Check if any map data needs to be sent
    this.engine.getAllComponents(TileVisibility).forEach((visibility) => {
      visibility.pending.forEach((chunk, i) => {
        this.sendMapData(visibility.entity, chunk)
        visibility.pending.splice(i, 1)
      })
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

  private getHandshake(socket: WebSocket) {
    return new Promise<{ name: string }>((resolve) => {
      const checkMessage = (data: WebSocket.Data) => {
        if (typeof data !== 'string') {
          return
        }

        const packet = Protocol.decode(data)

        if (packet.type === 'handshake') {
          resolve(packet)
          socket.off('message', checkMessage)
        }
      }

      socket.on('message', checkMessage)
    })
  }

  /** Sends a message to all connected clients */
  private broadcast(packet: Packet) {
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
  private sendImage(socket: WebSocket, name: string, filename: string) {
    // Read as base64
    const data = readFileSync(`../assets/${filename}`, {
      encoding: 'base64',
    })

    // Encode to a packet
    socket.send(Protocol.encode({ type: 'image', name, data }))
  }

  private sendMapData(entity: Entity, data: TileMapChunk) {
    const socket = this.clientMap.get(entity)

    // Exit if we can't communicate wit hthis socket
    if (!socket || socket.readyState !== WebSocket.OPEN) {
      return
    }

    // Encode to a packet
    socket.send(Protocol.encode({ type: 'mapdata', data }))
  }
}
