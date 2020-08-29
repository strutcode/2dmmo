import Vue from 'vue'

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

let clientGid = 0
class ClientView {
  private id = clientGid++

  constructor(socket: Socket) {
    socket.onMessage = data => {
      console.dir(`Client ${this.id} recieved:`, data)
    }
  }
}

class ServerView implements Record<string | number | symbol, any> {
  constructor(private socket: Socket) {
    return new Proxy(this, {
      set(obj, prop, value) {
        obj.sync(value)
        obj[prop] = value

        return true
      }
    })
  }

  sync(value: any) {
    if (!value[IdSymbol]) {
      console.error(`Not a networked object!`)
      return false
    }

    this.socket.send({
      action: 'create',
      type: value[TypeSymbol],
      id: value[IdSymbol],
      delta: Object.keys(value).reduce((acc, field) => {
        if (value[field][IdSymbol]) {
          acc[field] = `${value[field][TypeSymbol]}:${value[field][IdSymbol]}`
        }
        else if (value[FieldsSymbol].length < 1 || value[FieldsSymbol].includes(field)) {
          acc[field] = value[field]
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

    observe(value)
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

@NetworkSync()
class HeroList {
  list: Hero[] = []

  add(hero: Hero) {
    this.list.push(hero)
  }
}

class MyView extends ServerView {
  hero = new Hero()
  players = new HeroList()
}

class Server {
  private clients: MyView[] = []

  connection(socket: Socket) {
    const client = new Socket()

    socket.connectedTo = client
    client.connectedTo = socket

    const view = new MyView(client)

    this.clients.forEach(client => {
      view.players.add(client.hero)
      client.players.add(view.hero)
    })
    this.clients.push(view)
    console.log('client connected')
  }
}

class Client {
  private socket = new Socket()
  public view = new ClientView(this.socket)

  connect(server: Server) {
    server.connection(this.socket)
    console.log('connected to server')
  }
}

const server = new Server()

const ClientComponent = Vue.extend({
  render(h): Vue.VNode {
    return h('div', 'Hello world')
  },
  data() {
    return {
      client: new Client()
    }
  },
  created() {
    this.client.connect(server)
  }
})

new Vue({
  el: document.body,
  render(h): Vue.VNode {
    return h('div', [
      h('div', this.clients.map(() => h(ClientComponent))),
      h('button', { on: { click: () => { this.clients.push(Math.random().toString(36)) } } }, 'Add Client')
    ])
  },
  data() {
    return {
      clients: [] as string[]
    }
  }
})