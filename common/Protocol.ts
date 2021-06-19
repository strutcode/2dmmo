export type Packet =
  | {
      type: 'input'
      key: string
    }
  | {
      type: 'ping'
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
