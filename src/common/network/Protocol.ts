export enum ClientPacket {
  Input,
}

export enum ServerPacket {
  Move,
  Map,
}

export default class Protocol {
  static clientEncode(type: ClientPacket, data: Record<string, any>) {
    const prefix = (() => {
      switch (type) {
        case ClientPacket.Input:
          return 'INPT'
        default:
          throw `Unknown packet type: ${type}`
      }
    })()

    return `${prefix}~${JSON.stringify(data)}`
  }

  static serverEncode(
    type: ServerPacket,
    id: string,
    data: Record<string, any>,
  ) {
    const prefix = (() => {
      switch (type) {
        case ServerPacket.Move:
          return 'MOVE'
        case ServerPacket.Map:
          return 'TILE'
        default:
          throw `Unknown packet type: ${type}`
      }
    })()

    return `${prefix}~${JSON.stringify(data)}`
  }

  static clientDecode(data: string) {
    const type = data.substr(0, 4)
    const content = data.substr(5)

    return {
      type,
      data: JSON.parse(content),
    }
  }

  static serverDecode() {}
}
