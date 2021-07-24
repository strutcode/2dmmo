import System from '../../../common/engine/System'
import WebSocket, { Server } from 'ws'
import Protocol, { Packet } from '../../../common/Protocol'
import Entity from '../../../common/engine/Entity'
import TilePosition from '../../../common/components/TilePosition'
import Input from '../components/Input'
import { readFileSync } from 'fs'
import TileVisibility from '../components/TileVisibility'
import { TileMapChunk } from '../util/MapLoader'
import Mobile from '../components/Mobile'
import Container from '../components/Container'
import Affectable from '../components/Affectable'
import Player from '../components/Player'
import Speaker from '../components/Speaker'
import Listener from '../components/Listener'

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
      const name = handshake.name ?? 'Soandso'
      const sprite = handshake.sprite ?? 'swordman'

      // Create the entity for tracking
      const entity = this.engine.createEntity([
        Input,
        Player,
        Speaker,
        Listener,
        [
          Mobile,
          {
            name,
            sprite,
          },
        ],
        Container,
        Affectable,
        TilePosition,
        TileVisibility,
      ])

      // Register the entity
      this.mobileMap.set(entity, {})

      // Register the socket
      this.clientMap.set(entity, socket)

      // Send intialization packet
      socket.send(Protocol.encode({ type: 'authorize', id: entity.id }))
      console.log(`Player '${name}' joined`)

      // Sync all existing entities
      this.engine.getAllComponents(TilePosition).forEach((pos) => {
        pos.entity.with(Mobile, (mob) => {
          socket.send(
            Protocol.encode({
              type: 'spawn',
              id: pos.entity.id,
              name: mob.name,
              sprite: mob.sprite,
              x: pos.x,
              y: pos.y,
            }),
          )
        })
      })

      // Sync the new player to others
      this.broadcast({
        type: 'spawn',
        id: entity.id,
        name,
        sprite,
        x: 0,
        y: 0,
      })

      // Sync inventory
      entity.with(Container, (inventory) => {
        // TODO: Do this on change
        socket.send(
          Protocol.encode({
            type: 'inventory',
            cards: inventory.deck.map((card) => ({
              id: card.id,
              title: card.title,
            })),
          }),
        )
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
    this.engine.forEachCreated(Mobile, (mob) => {
      mob.entity.with(TilePosition, (pos) => {
        this.broadcast({
          type: 'spawn',
          id: mob.entity.id,
          name: mob.name,
          sprite: mob.sprite,
          x: pos?.x ?? 0,
          y: pos?.y ?? 0,
        })
      })
    })

    this.engine.forEachDeleted(Mobile, (mob) => {
      this.broadcast({
        type: 'despawn',
        id: mob.entity.id,
      })
    })

    // Process input packets
    this.pending.forEach(({ entity, packet }, i) => {
      if (packet.type === 'input') {
        entity.with(Input, (input) => {
          // Record the request
          input.addInput(packet.key)
        })
      } else if (packet.type === 'chat') {
        entity.with(Speaker, (speaker) => {
          speaker.say(packet.msg)
        })
      } else if (packet.type === 'use') {
        entity.with(Input, (input) => {
          // Record the request
          input.useCard(packet.card, packet.target)
        })
      }
    })

    // Clear the queue
    this.pending = []

    this.engine.forEachUpdated(Container, (inv) => {
      const socket = this.clientMap.get(inv.entity)

      socket?.send(
        Protocol.encode({
          type: 'inventory',
          cards: inv.deck,
        }),
      )
    })

    // Check if any map data needs to be sent
    this.engine.forEachComponent(TileVisibility, (visibility) => {
      visibility.pending.forEach((chunk, i) => {
        this.sendMapData(visibility.entity, chunk)
        visibility.pending.splice(i, 1)
      })
    })

    // Check if any entities moved
    this.engine.forEachUpdated(TilePosition, (pos) => {
      this.broadcast({
        type: 'move',
        id: pos.entity.id,
        x: pos.x,
        y: pos.y,
      })
    })

    // If messages were heard by players, send them over the socket
    this.engine.forEachComponent(Player, (player) => {
      player.entity.with(Listener, (listener) => {
        const socket = this.clientMap.get(player.entity)

        if (socket) {
          listener.incoming.forEach((msg) => {
            socket.send(
              Protocol.encode({
                type: 'chat',
                id: msg.speaker,
                msg: msg.words,
              }),
            )
          })
        }
      })
    })
  }

  /** Asynchronously waits for the handshake packet */
  private getHandshake(socket: WebSocket) {
    return new Promise<{ name: string; sprite: string }>((resolve) => {
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

  /** Sends map data over the socket to a player */
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
