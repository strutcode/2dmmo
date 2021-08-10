/** Defines the type of decoded network messages */
export type Packet =
  | {
      type: 'listQuests'
      entries?: { name: string }[]
    }
  | {
      type: 'questContent'
      name: string
      content?: string
    }

/** Defines the type of encoded network messages */
export type Message = string

/** Defines the format of communication between the client and server */
export default class EditorProtocol {
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
