const TypeSymbol = Symbol('type')
const IdSymbol = Symbol('id')
const ParentSymbol = Symbol('parent')
const FieldsSymbol = Symbol('fields')
const RegSymbol = Symbol('register')
const NotSymbol = Symbol('notify')

function proxify(value: any, parent?: any, path: string[] = []) {
  if (typeof value !== 'object') return value

  if (parent) value[ParentSymbol] = parent

  for (let key in value) {
    if (typeof value[key] === 'object') {
      if (value[key][IdSymbol]) {
      } else {
        value[key] = proxify(value[key], value, [...path, key])
      }
    }
  }

  let delta: any = {}
  let timer: number | undefined

  return new Proxy(value, {
    set(obj, prop, value) {
      const parent = obj[ParentSymbol]
      const type = parent ? parent[TypeSymbol] : obj[TypeSymbol]
      const id = parent ? parent[IdSymbol] : obj[IdSymbol]


      let thing = delta
      path.forEach(key => {
        thing[key] ??= {}
        thing = thing[key]
      })
      thing[prop] = value
      obj[prop] = value

      if (!timer) {
        timer = setTimeout(() => {
          (parent || obj)[NotSymbol](type, id, delta)
          timer = undefined
          delta = {}
        })
      }

      return true
    },
  })
}

function NetworkSync(...watchedFields: string[]) {
  let gid = 0

  return function<T extends { new (...args: any[]): {} }>(Base: T) {
    return (function(...args: any[]) {
      const inst = new Base(...args) as any

      inst[TypeSymbol] = Base.name
      inst[IdSymbol] = String(gid++)
      inst[FieldsSymbol] = watchedFields

      const listeners: Function[] = []
      inst[RegSymbol] = (callback: Function) => {
        listeners.push(callback)
      }
      inst[NotSymbol] = (type: string, id: string, delta: any) => {
        listeners.forEach(listener => {
          listener(type, id, delta)
        })
      }

      return proxify(inst)
    } as unknown) as T
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
    socket.onMessage = data => {
      console.dir('Client recieved:', data)
    }
  }
}

class ServerView {
  constructor(private socket: Socket) {}

  public sync(obj: any) {
    if (!obj[IdSymbol]) {
      throw `Not a networked object!`
    }

    this.socket.send({
      action: 'create',
      type: obj[TypeSymbol],
      id: obj[IdSymbol],
      delta: Object.keys(obj).reduce((acc, field) => {
        if (obj[field][IdSymbol]) {
          acc[field] = `${obj[field][TypeSymbol]}:${obj[field][IdSymbol]}`
        }
        else if (obj[FieldsSymbol].includes(field)) {
          acc[field] = obj[field]
        }

        return acc
      }, {} as any)
    })

    const observe = (target: Record<string | typeof RegSymbol, any>) => {
      Object.values(target).forEach(value => {
        if (typeof value === 'object' && value[IdSymbol]) {
          observe(value)
        }
      })
      
      target[RegSymbol]((type: string, id: string, delta: any) => {
        this.socket.send({
          action: 'update',
          type,
          id,
          delta
        })
      })
    }

    observe(obj)
  }
}

@NetworkSync('items')
class Container {
  items = ['foo', 'bar']
}

@NetworkSync('x', 'y', 'hp', 'inventory')
class Hero {
  x = 0
  y = 0
  hp = 100
  inventory = new Container()
}

const serverSocket = new Socket()
const clientSocket = new Socket()

serverSocket.connectedTo = clientSocket
clientSocket.connectedTo = serverSocket

const serverView = new ServerView(clientSocket)
const clientView = new ClientView(serverSocket)

const hero = new Hero()

console.log('Let there be sync')
serverView.sync(hero)

Object.assign(global, {
  hero,
  localView: serverView,
  remoteView: clientView,
})
