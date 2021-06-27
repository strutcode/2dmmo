import System from '../../../common/engine/System'
import Protocol, { Packet } from '../../../common/Protocol'
import CameraFollow from '../components/CameraFollow'
import CardData from '../components/CardData'
import ChatData from '../components/ChatData'
import Creature from '../components/Creature'
import InputQueue from '../components/InputQueue'
import LatencyGraph from '../components/LatencyGraph'
import Sprite from '../components/Sprite'
import SpriteLoadQueue from '../components/SpriteLoadQueue'
import TileMap from '../components/TileMap'

export default class NetworkClient extends System {
  /** The entity ID of the local player */
  private localId?: number

  /** The client socket implementation */
  private socket?: WebSocket

  /** The relative time that the last ping was sent out */
  private pingTime = 0
  /** The id of the interval that sends pings */
  private pingInterval = 0

  /** Data used to control the reconnect process */
  private reconnectData = {
    /** Time to wait before reconnecting */
    time: 1000,
    /** How many more attempts to make */
    attempts: 3,
  }

  public start() {
    // Attempt to connect
    console.log('Connecting to server...')
    this.connect()
  }

  public update() {
    this.engine.with(InputQueue, (queue) => {
      // Send all player inputs to the server for processing
      queue.actions.forEach((action) => {
        this.send({ type: 'input', key: action })
      })
    })

    // Send outgoing chat to the server
    this.engine.with(ChatData, (chat) => {
      chat.outgoing.forEach((msg) => {
        this.send({
          type: 'chat',
          msg,
        })
      })
      chat.outgoing = []
    })
  }

  /** Sets up a socket connection to the server */
  private connect() {
    // Try to connect using the current hostname and matching protocol
    this.socket = new WebSocket(`${location.origin.replace('http', 'ws')}/data`)

    this.socket.addEventListener('open', () => {
      console.log('Connection established')

      // Since we connected successfully, allow more reconnects
      this.resetReconnectData()

      // Start sending pings. This is used to keep the connection alive and measure latency
      this.pingInterval = setInterval(
        () => {
          // Record the send time
          this.pingTime = performance.now()
          // Send the message
          this.send({ type: 'ping' })
        },
        // Twice per second
        500,
      ) as any

      // Send handshake
      const params = new URLSearchParams(location.search)
      this.socket?.send(
        Protocol.encode({
          type: 'handshake',
          name: params.get('name') ?? 'Soandso',
          sprite: params.get('sprite') ?? 'swordman',
        }),
      )

      // Handle messages
      this.socket?.addEventListener('message', this.recv.bind(this))
    })

    // When the connection is lost
    this.socket?.addEventListener('close', () => {
      console.log('Connection lost.')

      // Clean up the timer if any
      if (this.pingInterval) {
        clearInterval(this.pingInterval)
      }

      // The client state is going to be messed up now so clear it all out
      this.engine.getEntities().forEach((entity) => {
        // Ignore the global entity
        if (entity.getComponent(LatencyGraph)) return

        this.engine.destroyEntity(entity)
      })

      // Attempt to reconnect
      this.reconnect()
    })
  }

  /** Attempts to re-establish a failed connectino to the server */
  private reconnect() {
    if (this.reconnectData.attempts > 0) {
      let reconnectTime: number | string = this.reconnectData.time / 1000

      if (Math.floor(reconnectTime) != reconnectTime) {
        reconnectTime = reconnectTime.toFixed(1)
      }

      console.log(`Attempting to reconnect in ${reconnectTime}s...`)

      // Attempt to connect after the specified time
      setTimeout(() => {
        console.log('Reconnecting...')
        this.connect()
      }, this.reconnectData.time)

      // Adjust the parameters for next time if the connection fails
      this.reconnectData.time *= 2
      this.reconnectData.attempts--
    } else {
      console.log('All reconnect attempts failed, quitting.')
      location.assign(location.origin)
    }
  }

  /** Resets the reconnect tracking state */
  private resetReconnectData() {
    this.reconnectData.time = 1000
    this.reconnectData.attempts = 3
  }

  /** Handles data received from the server */
  private recv(msg: MessageEvent<any>) {
    // Record precisely when the message arrived
    const now = performance.now()

    if (typeof msg.data !== 'string') {
      // Only accept the standard format
      return
    }

    // Get the message details
    const packet = Protocol.decode(msg.data)

    // A response to our ping request
    if (packet.type === 'ping') {
      this.engine.with(LatencyGraph, (graph) => {
        // Use the exact receive time to record latency
        graph.logLatency(now - this.pingTime)
      })
    }
    // Initial login response
    else if (packet.type === 'authorize') {
      // Record our ID
      this.localId = packet.id
    }
    // Initial login response
    else if (packet.type === 'inventory') {
      // TODO: Just cards for now
      this.engine.with(CardData, (data) => {
        data.titles = packet.items.map((item) => item.title)
      })
    }
    // An entity appeared
    else if (packet.type === 'spawn') {
      let entity = this.engine.getEntity(packet.id)

      // If the entity already exists
      if (entity) {
        // Do nothing
      }
      // If the server ID matches our local id...
      else if (packet.id === this.localId) {
        // Create the local player
        entity = this.engine.createEntity({
          id: packet.id,
          components: [
            InputQueue, // Allow input
            CameraFollow, // Follow this entity
            [
              Creature,
              {
                name: packet.name,
                sprite: packet.sprite,
              },
            ],
            [
              Sprite,
              {
                x: packet.x * 16,
                y: packet.y * 16,
                name: `${packet.sprite ?? 'swordman'}_stand`,
                fps: 4,
              },
            ],
          ],
        })
      } else {
        // Otherwise create a puppet
        entity = this.engine.createEntity({
          id: packet.id,
          components: [
            [
              Creature,
              {
                name: packet.name,
                sprite: packet.sprite,
              },
            ],
            [
              Sprite,
              {
                x: packet.x * 16,
                y: packet.y * 16,
                name: `${packet.sprite ?? 'swordman'}_stand`,
                fps: 4,
              },
            ],
          ],
        })
      }
    }
    // An entity disappeared
    else if (packet.type === 'despawn') {
      // Destroy the puppet
      this.engine.destroyEntity(packet.id)
    }
    // Someone said something
    else if (packet.type === 'chat') {
      if (!packet.id) return // wtf server?

      // Find the local puppet by id
      const entity = this.engine.getEntity(packet.id)

      if (entity) {
        this.engine.with(ChatData, (chat) => {
          if (packet.id === this.localId) {
            chat.incoming.push(`You say '${packet.msg}'`)
          } else {
            entity.with(Creature, (meta) => {
              chat.incoming.push(`${meta.name} says '${packet.msg}'`)
            })
          }
        })
      }
    }
    // An entity changed position
    else if (packet.type === 'move') {
      // Find the local puppet by id
      const entity = this.engine.getEntity(packet.id)

      if (entity) {
        // Update the position
        entity.with(Sprite, (visual) => {
          visual.x = packet.x * 16
          visual.y = packet.y * 16
        })
      }
    }
    // Received image data from the server
    else if (packet.type === 'image') {
      // Add it to the processing queue to be handled by the graphics system
      this.engine.with(SpriteLoadQueue, (queue) => {
        queue.addData(packet.name, packet.data)
      })
    }
    // Received map data from the server
    else if (packet.type === 'mapdata') {
      // Add the data to the processing queue
      this.engine.with(TileMap, (tileMap) => {
        tileMap.toLoad.push(packet.data)
      })
    }
    // Hmmmm
    else {
      console.log(`Unrecognized message: ${packet.type}`)
    }
  }

  /** A wrapper to safely send data over the socket */
  private send(packet: Packet) {
    // If the socket isn't connected, give up
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
      return
    }

    // Encode the data and send it
    this.socket.send(Protocol.encode(packet))
  }
}
