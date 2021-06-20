import System from '../../../common/engine/System'
import Protocol, { Packet } from '../../../common/Protocol'
import CameraFollow from '../components/CameraFollow'
import InputQueue from '../components/InputQueue'
import LatencyGraph from '../components/LatencyGraph'
import Sprite from '../components/Sprite'
import SpriteLoadQueue from '../components/SpriteLoadQueue'

export default class NetworkClient extends System {
  /** The entity ID of the local player */
  private localId?: number
  /** The client socket implementation */
  private socket?: WebSocket
  /** The relative time that the last ping was sent out */
  private pingTime = 0
  /** The id of the interval that sends pings */
  private pingInterval = 0
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
    // Get the input queue from the input System
    const queue = this.engine.getComponent(InputQueue)

    if (queue) {
      // send all player inputs to the server for processing
      queue.actions.forEach((action) => {
        this.send({ type: 'input', key: action })
      })
    }
  }

  /** Sets up a socket connection to the server */
  private connect() {
    // Try to connect uysing the current hostname and matching protocol
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

      // Handle messages
      this.socket?.addEventListener('message', this.recv.bind(this))

      // When the connection is lost
      this.socket?.addEventListener('close', () => {
        console.log('Connection lost.')

        // The client state is going to be messed up now so clear it all out
        this.engine.getEntities().forEach((entity) => {
          // Ignore the global entity
          if (entity.getComponent(InputQueue)) return

          this.engine.destroyEntity(entity)
        })

        // Attempt to reconnect
        this.reconnect()
      })
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
      setTimeout(() => this.connect(), this.reconnectData.time)

      // Adjust the parameters for next time if the connection fails
      this.reconnectData.time *= 2
      this.reconnectData.attempts--
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
      // Use the exact receive time to record latency
      const graph = this.engine.getComponent(LatencyGraph)
      graph?.logLatency(now - this.pingTime)
    }
    // Initial login response
    else if (packet.type === 'authorize') {
      // Record our ID
      this.localId = packet.id
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
            Sprite,
          ],
        })
      } else {
        // Otherwise create a puppet
        entity = this.engine.createEntity({
          id: packet.id,
          components: [Sprite], // Just a visual
        })
      }

      // Set up the component data
      // TODO: Gotta find a better way
      const visual = entity?.getComponent(Sprite)
      if (visual) {
        visual.x = packet.x * 16
        visual.y = packet.y * 16
        visual.name = 'soldier_stand'
      }
    }
    // An entity disappeared
    else if (packet.type === 'despawn') {
      // Destroy the puppet
      this.engine.destroyEntity(packet.id)
    }
    // An entity changed position
    else if (packet.type === 'move') {
      // Find the local puppet by id
      const entity = this.engine.getEntity(packet.id)

      if (entity) {
        // Get the sprite
        const visual = entity.getComponent(Sprite)

        if (visual) {
          // Udpate the position
          visual.x = packet.x * 16
          visual.y = packet.y * 16
        }
      }
    }
    // Received image data from the server
    else if (packet.type === 'image') {
      // Add it to the processing queue to be handled by the graphics system
      const queue = this.engine.getComponent(SpriteLoadQueue)
      queue?.addData(packet.name, packet.data)
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
