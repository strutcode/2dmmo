/** Defines the type of decoded network messages */
export type Packet =
  | {
      type: 'ping'
    }
  | {
      type: 'input'
      key: string
    }
  | {
      type: 'handshake'
      name: string
    }
  | {
      type: 'authorize'
      id: number
    }
  | {
      type: 'spawn'
      id: number
      name: string
      sprite: string
      x: number
      y: number
    }
  | {
      type: 'despawn'
      id: number
    }
  | {
      type: 'move'
      id: number
      x: number
      y: number
    }
  | {
      type: 'image'
      name: string
      data: string
    }
  | {
      type: 'mapdata'
      data: {
        x: number
        y: number
        layers: number[][]
      }
    }

/** Defines the type of encoded network messages */
export type Message = string

/** Defines the format of communication between the client and server */
export default class Protocol {
  // TODO: Binary format
  // TODO: Allow switching between JSON and binary for debugging

  /** Convert data from JS to network format */
  public static encode(packet: Packet): Message {
    return JSON.stringify(packet)
  }

  /** Convert data from network format to JS */
  public static decode(message: Message): Packet {
    return JSON.parse(message)
  }
}
