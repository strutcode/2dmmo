export type Packet =
  | {
      type: 'ping'
    }
  | {
      type: 'input'
      key: string
    }
  | {
      type: 'authorize'
      id: number
    }
  | {
      type: 'spawn'
      id: number
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

export type Message = string

export default class Protocol {
  public static encode(packet: Packet): Message {
    return JSON.stringify(packet)
  }

  public static decode(message: Message): Packet {
    return JSON.parse(message)
  }
}
