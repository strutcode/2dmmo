import { reactive, watch } from 'vue'

const TypeSymbol = Symbol('obs')
const IdSymbol = Symbol('id')
const FieldsSymbol = Symbol('fields')

function NetworkSync<T extends { new(...args: any[]): any }>(...watchedFields: string[]) {
  let gid = 0

  return function (Base: T) {
    return class extends Base {
      ;[TypeSymbol] = Base.name
        ;[IdSymbol] = String(gid++)
        ;[FieldsSymbol] = watchedFields

      constructor(...args: any[]) {
        super(...args)

        return reactive(this)
      }
    }
  }
}

class Socket {
  connectedTo?: Socket

  send(data: any) {
    if (this.connectedTo) {
      this.connectedTo.receive(JSON.stringify(data))
    }
  }

  receive(data: string) {
    if (this.onMessage) {
      const result = JSON.parse(data)
      this.onMessage(result)
    }
  }

  onMessage?: (data: any) => void
}

class ClientView {
  constructor(private socket: Socket) {
    socket.onMessage = (data) => {
      console.log('Socket got:', data)
    }
  }
}

class ServerView {
  constructor(private socket: Socket) { }

  public sync(obj: any) {
    const send = (obj: any, action: string) => {
      if (!obj[FieldsSymbol]) {
        throw `Not a networked object!`
      }

      const fields = obj[FieldsSymbol] as string[]
      const type = obj[TypeSymbol] as string
      const id = obj[IdSymbol] as string
      const value = fields.reduce((acc, field) => {
        acc[field] = obj[field]

        return acc
      }, {} as any)

      console.log(type, id, 'changed')
      this.socket.send({
        action,
        type,
        id,
        value
      })
    }

    if (!obj[FieldsSymbol]) {
      throw `Not a networked object!`
    }

    const fields = obj[FieldsSymbol] as string[]
    const type = obj[TypeSymbol] as string
    const id = obj[IdSymbol] as string
    const value = fields.reduce((acc, field) => {
      if (obj[field]) {
        if (obj[field][FieldsSymbol]) {
          acc[field] = `${obj[field][TypeSymbol]}:${obj[field][IdSymbol]}`
        }
        else {
          acc[field] = obj[field]
        }
      }

      return acc
    }, {} as any)

    console.log(type, id, 'created')
    this.socket.send({
      action: 'create',
      type,
      id,
      value
    })

    watch(obj, () => {
      const fields = obj[FieldsSymbol] as string[]
      const type = obj[TypeSymbol] as string
      const id = obj[IdSymbol] as string
      const value = fields.reduce((acc, field) => {
        acc[field] = obj[field]

        return acc
      }, {} as any)

      console.log(type, id, 'updated')
      this.socket.send({
        action: 'update',
        type,
        id,
        value
      })
    })
  }
}

@NetworkSync('items')
class Container {
  items = []
}

@NetworkSync('hp', 'inventory')
class Hero {
  x = 0
  y = 0
  hp = 100
  inventory = new Container()
}

const server = new Socket()
const client = new Socket()

server.connectedTo = client
client.connectedTo = server

const localView = new ServerView(client)
const remoteView = new ClientView(server)

const hero = new Hero()

localView.sync(hero)

Object.assign(global, {
  hero,
  localView,
  remoteView
})