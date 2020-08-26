import FakeSocket from '../common/FakeSocket'

type OnAddCallback = (type: string, props: any, id: string) => void

export default class NetworkView {
  private socket = new FakeSocket()

  public onAdd?: (type: string, id: string, props: any) => void
  public onUpdate?: (type: string, id: string, props: any) => void

  constructor() {
    this.socket.onClientAdd = (...args) => {
      console.log('client add:', ...args)

      if (this.onAdd) {
        this.onAdd(...args)
      }
    }

    this.socket.onClientUpdate = (...args) => {
      console.log('client update:', ...args)

      if (this.onAdd) {
        this.onAdd(...args)
      }
    }

    this.socket.connect()
  }
  // private entities = new Map<string, any>()
  // private listeners: Record<string, Function[]> = {}

  // public on(event: 'add', callback: OnAddCallback): void
  // public on(event: string, callback: Function) {
  //   this.listeners[event] ??= []
  //   this.listeners[event].push(callback)
  // }

  // public add(type: string, id: string, props: any) {
  //   this.entities.set(type + id, props)

  //   for (let i = 0; i < this.listeners['add']?.length; i++) {
  //     this.listeners['add'][i](type, props, id)
  //   }
  // }

  // public update(type: string, id: string, prop: string, value: any) {
  //   const ent = this.entities.get(type + id)

  //   if (ent) ent[prop] = value
  // }

  // public clear() {
  //   this.entities.clear()
  // }
}
