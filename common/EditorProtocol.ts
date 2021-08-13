/** Defines the type of decoded network messages */
export type Packet =
  | {
      type: 'ack'
    }
  | {
      type: 'listQuests'
      entries?: { name: string }[]
    }
  | {
      type: 'questContent'
      name: string
      content?: string
    }
  | {
      type: 'createDocument'
      kind: string
      name: string
      content?: string
    }
  | {
      type: 'saveDocument'
      kind: string
      name: string
      content: string
    }
  | {
      type: 'deleteDocument'
      kind: string
      name: string
    }

/** Defines the type of encoded network messages */
export type Message = string

/** Defines the format of communication between the client and server */
export default class EditorProtocol {
  /** Convert data from JS to network format */
  public static encode(packet: Packet): Message {
    return JSON.stringify(packet)
  }

  /** Convert data from network format to JS */
  public static decode(message: Message): Packet {
    return JSON.parse(message)
  }
}
