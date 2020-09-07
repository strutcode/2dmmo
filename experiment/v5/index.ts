const SyncSym = Symbol('networkSync')

type InputClass = { new (...args: any[]): any }

function NetworkSync<T extends InputClass>(target: T): T
function NetworkSync<T extends InputClass>(
  fields: string[],
): (...args: ConstructorParameters<T>) => T
function NetworkSync<T extends InputClass>(...args: [T] | string[]) {
  const sync = (target: any, fields: string[] | true) => {
    const id = netId++
    const proto = Object.getPrototypeOf(target)

    if (target[SyncSym]) return target
    target[SyncSym] = {
      id,
      type: proto.constructor.name,
      proto,
      callbacks: [],
      fields,
    }

    for (let key in target) {
      if (typeof target[key] === 'object') {
        target[key] = sync(target[key], true)
      }
    }

    let delta: Record<string, any> = {}
    let timer: number | undefined

    console.log('proxify', proto.constructor.name, id)
    return new Proxy(target, {
      set(obj: any, prop, value) {
        if (typeof value === 'object' && !value[SyncSym]) {
          obj[prop] = sync(value, true)
        } else {
          obj[prop] = value
        }

        console.log('set', proto.constructor.name, id, prop, value)
        delta[prop.toString()] = value
        if (!timer) {
          timer = setTimeout(() => {
            obj[SyncSym].callbacks.forEach((callback: any) => {
              callback(obj[SyncSym], delta)
            })

            delta = {}
            timer = undefined
          })
        }

        return true
      },
    })
  }

  if (typeof args[0] === 'string') {
    const fields = args as string[]

    return function (Base: T) {
      console.log(Base, NetworkView)
      if (Base === NetworkView) {
        console.log('dkjfgdkfjg')
      }

      const result = function (...args: ConstructorParameters<T>) {
        return sync(new Base(...args), fields)
      }

      result[SyncSym] = Base.name

      return result
    }
  } else {
    const Base = args[0]
    console.log(Base, NetworkView)
    if (Base === NetworkView) {
      console.log('dkjfgdkfjg')
    }

    const result = function (...args: ConstructorParameters<T>) {
      return sync(new Base(...args), true)
    }

    result[SyncSym] = Base.name

    return result
  }
}

let netId = 0

@NetworkSync
class NetworkView {
  constructor(socket: Socket, types?: any[]) {
    const addListener = (
      obj: Record<string | typeof SyncSym, any>,
      callback: (syncData: object, delta: object) => void,
    ) => {
      if (obj[SyncSym]) {
        obj[SyncSym].callbacks.push(callback)
      }

      for (let key in obj) {
        if (typeof obj[key] === 'object') {
          addListener(obj[key], callback)
        }
      }
    }

    const serialize = (obj: Record<string | typeof SyncSym, any>) => {
      const value: Record<string, any> = {
        type: obj[SyncSym].type,
        id: obj[SyncSym].id,
        delta: {},
        refs: {},
      }

      for (let key in obj) {
        const syncData = obj[key][SyncSym]
        if (syncData) {
          value.refs[key] = syncData.id
          socket.send(serialize(obj[key]))
        } else if (typeof obj[key] === 'object') {
          value.delta[key] = serialize(obj[key])
        } else {
          value.delta[key] = obj[key]
        }
      }

      return value
    }

    const registrations = new Map<string, any>()
    const objectMap = new Map<number, any>()

    if (types) {
      types.forEach((type) => {
        if (type[SyncSym]) {
          console.log('register sym', type[SyncSym], type)
          registrations.set(type[SyncSym], type)
        } else {
          console.log('register', type.name, type)
          registrations.set(type.name, type)
        }
      })
    }
    const deserialize = (container) => {
      if (!objectMap.has(container.id)) {
        let proto: Function = Object

        if (typeof window[container.type] === 'function') {
          proto = window[container.type] as any
        } else if (registrations.has(container.type)) {
          proto = registrations.get(container.type)
        } else {
          console.warn(`No prototype found: '${container.type}'`)
        }

        const obj = new proto()
        // Object.setPrototypeOf(obj, proto)
        objectMap.set(container.id, obj)
      }

      const data = container.delta
      const target = objectMap.get(container.id)

      for (let key in data) {
        if (typeof data[key] === 'object') {
          deserialize(data[key])
        } else {
          target[key] = data[key]
        }
      }

      return target
    }

    socket.onMessage = (data) => {
      console.dir('Sync: got', data)
      const obj = deserialize(data)

      if (data.prop) {
        this[data.prop] = obj
      }
    }

    return new Proxy(this, {
      set: (obj, prop, value) => {
        if (prop != SyncSym) {
          console.log('init', prop, value)
          addListener(value, (syncData, delta) => {
            socket.send({
              id: syncData.id,
              delta,
            })
          })
          socket.send({
            prop,
            ...serialize(value),
          })
        }

        obj[prop] = value
        return true
      },
    })
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

@NetworkSync
class Container {
  private list: string[] = []

  add(item: string) {
    this.list.push(item)
  }
}

@NetworkSync('x', 'y')
class Hero {
  x = 0
  y = 0
  hp = 100
  inventory = new Container()
}

class Client extends NetworkView {
  constructor(socket: Socket) {
    super(socket, [Hero, Container])
    // socket.onMessage = (data) => {
    //   console.log('Client got', data)
    // }
  }
}

class MyView extends NetworkView {
  hero: Hero = new Hero()
  players: Hero[] = []
}

class Server {
  private clients: MyView[] = []

  public connection(remote: Socket) {
    const local = new Socket()

    remote.connectedTo = local
    local.connectedTo = remote
    console.log('client connected')

    const view = new MyView(local)

    setTimeout(() => {
      view.hero.x++
    }, 2000)

    this.clients.forEach((client) => {
      view.players.push(client.hero)
      client.players.push(view.hero)
    })

    this.clients.push(view)
  }
}

const server = new Server()
const socket = new Socket()
const client = new Client(socket)
server.connection(socket)

Object.assign(global, { server, client })
