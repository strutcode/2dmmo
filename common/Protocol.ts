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
      type: 'use'
      card: string
      target: number
    }
  | {
      type: 'inventory'
      cards: { id: string; title: string }[]
      items: { name: string; icon: string }[]
    }
  | {
      type: 'chat'
      id?: number
      msg: string
    }
  | {
      type: 'handshake'
      name: string
      sprite: string
    }
  | {
      type: 'authorize'
      id: number
    }
  | {
      type: 'spawn'
      id: number
      kind: 'mobile' | 'item'
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
        passable: boolean[]
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
