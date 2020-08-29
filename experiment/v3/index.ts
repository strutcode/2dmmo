import Vue from 'vue'

const OriginalSymbol = Symbol('original')
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
      path.forEach((key) => {
        thing[key] ??= {}
        thing = thing[key]
      })
      thing[prop] = value
      obj[prop] = value

      if (!timer) {
        timer = setTimeout(() => {
          ;(parent || obj)[NotSymbol](type, id, delta)
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

  return function <T extends { new (...args: any[]): {} }>(Base: T) {
    const newType: T = (function (...args: any[]) {
      const inst = new Base(...args) as any

      inst[TypeSymbol] = Base.name
      inst[IdSymbol] = String(gid++)
      inst[FieldsSymbol] = watchedFields

      const listeners: Function[] = []
      inst[RegSymbol] = (callback: Function) => {
        listeners.push(callback)
      }
      inst[NotSymbol] = (type: string, id: string, delta: any) => {
        listeners.forEach((listener) => {
          listener(type, id, delta)
        })
      }

      return proxify(inst)
    } as unknown) as T

    newType[OriginalSymbol] = Base

    return newType
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

class NetworkView implements Record<string | number | symbol, any> {
  private registrations = new Map<string, any>()
  private syncedObjs = new Map<string, any>()

  constructor(private socket: Socket, name: string) {
    socket.onMessage = (data) => {
      console.dir(`${name} recieved:`, data)
      const apply = (obj, target) => {
        for (let key in obj) {
          if (typeof obj[key] === 'object') {
            target[key] ??= obj['length'] ? [] : {}
            apply(obj[key], target[key])
          } else {
            target[key] = obj[key]
          }
        }

        return target
      }

      if (!this.syncedObjs.has(`${data.type}:${data.id}`)) {
        this.syncedObjs.set(`${data.type}:${data.id}`, {})
      }

      const ref = this.syncedObjs.get(`${data.type}:${data.id}`)
      const obj = apply(data.delta, ref)

      if (data.action === 'init') {
        console.log('init', data.type, data.prop)
        if (this.registrations.has(data.type)) {
          console.log('registered as', data.type)
          Object.setPrototypeOf(
            obj,
            this.registrations.get(data.type).prototype,
          )
        }

        this[data.prop] = obj
      }
    }

    return new Proxy(this, {
      set(obj, prop, value) {
        obj.sync(value, prop)
        obj[prop] = value

        return true
      },
    })
  }

  register(type: any) {
    const proto = type[OriginalSymbol] || type
    const name = proto.name

    console.log('register', name, proto)
    this.registrations.set(name, proto)
  }

  sync(value: any, prop?: string) {
    if (!value[IdSymbol]) {
      console.error(`Not a networked object!`)
      return false
    }

    this.socket.send({
      action: prop ? 'init' : 'create',
      prop,
      type: value[TypeSymbol] || Object.getPrototypeOf(value).name,
      id: value[IdSymbol],
      delta: Object.keys(value).reduce((acc, field) => {
        if (value[field][IdSymbol]) {
          acc[field] = `${value[field][TypeSymbol]}:${value[field][IdSymbol]}`
          this.sync(value[field])
        } else if (
          value[FieldsSymbol].length < 1 ||
          value[FieldsSymbol].includes(field)
        ) {
          acc[field] = value[field]
        }

        return acc
      }, {} as any),
    })

    const observe = (target: Record<string | typeof RegSymbol, any>) => {
      Object.values(target).forEach((value) => {
        if (typeof value === 'object' && value[IdSymbol]) {
          observe(value)
        }
      })

      target[RegSymbol]((type: string, id: string, delta: any) => {
        this.socket.send({
          action: 'update',
          type,
          id,
          delta,
        })
      })
    }

    observe(value)
  }
}

@NetworkSync('items')
class Container {
  items = []
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

  map(callback: (hero: Hero) => any): any[] {
    return this.list.map(callback)
  }
}

class MyView extends NetworkView {
  hero = new Hero()
  players = new HeroList()

  constructor(...args: ConstructorParameters<typeof NetworkView>) {
    super(...args)

    this.register(Container)
    this.register(Hero)
    this.register(HeroList)
  }
}

class Server {
  private clients: MyView[] = []

  connection(socket: Socket) {
    const client = new Socket()

    socket.connectedTo = client
    client.connectedTo = socket

    const view = new MyView(client, 'server')

    this.clients.forEach((client) => {
      view.players.add(client.hero)
      client.players.add(view.hero)
    })

    this.clients.push(view)
    console.log('client connected')
  }
}

let n = 0
class Client {
  private socket = new Socket()
  public view = new MyView(this.socket, `client ${n++}`)

  connect(server: Server) {
    server.connection(this.socket)
    console.log('connected to server')
  }
}

const server = new Server()

const ClientComponent = Vue.extend({
  render(h): Vue.VNode {
    const { hero, players } = this.client.view
    const playerBox = { position: 'absolute', width: '16px', height: '16px' }

    return h(
      'div',
      {
        attrs: {
          tabIndex: -1,
        },
        style:
          'display: inline-block; position: relative; background: lightgrey; width: 160px; height: 160px',
        on: {
          keydown: (ev: KeyboardEvent) => {
            switch (ev.key) {
              case 'w':
                this.client.view.hero.y--
                break
              case 's':
                this.client.view.hero.y++
                break
              case 'a':
                this.client.view.hero.x--
                break
              case 'd':
                this.client.view.hero.x++
                break
            }
          },
        },
      },
      [
        h('div', {
          style: {
            ...playerBox,
            background: 'orange',
            top: `${hero.y * 16}px`,
            left: `${hero.x * 16}px`,
          },
        }),
        ...players.map((player) =>
          h('div', {
            style: {
              ...playerBox,
              background: 'purple',
              top: `${player.y * 16}px`,
              left: `${player.x * 16}px`,
            },
          }),
        ),
      ],
    )
  },
  data() {
    return {
      client: new Client(),
    }
  },
  created() {
    this.client.connect(server)
  },
})

new Vue({
  el: document.body,
  render(h): Vue.VNode {
    return h('div', [
      h(
        'div',
        this.clients.map(() => h(ClientComponent)),
      ),
      h(
        'button',
        {
          on: {
            click: () => {
              this.clients.push(Math.random().toString(36))
            },
          },
        },
        'Add Client',
      ),
    ])
  },
  data() {
    return {
      clients: [] as string[],
    }
  },
})
