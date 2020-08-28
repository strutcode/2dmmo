import FakeSocket from './FakeSocket'

export default class ClientView {
  private socket = new FakeSocket()
  private entities = new Map<string, any>()

  public onAdd?: (props: any) => void

  constructor() {
    this.socket.onClientAdd = (type: string, id: string, props: any) => {
      console.log('client add:', type, id, props)

      this.entities.set(type + id, JSON.parse(props))

      if (this.onAdd) {
        this.onAdd(this.entities.get(type + id))
      }
    }

    this.socket.onClientUpdate = (type: string, id: string, props: any) => {
      console.log('client update:', type, id, props)

      const ent = this.entities.get(type + id)

      if (ent) {
        Object.assign(ent, JSON.parse(props))
      }
    }
  }

  public connect() {
    this.socket.connect()
  }
}
