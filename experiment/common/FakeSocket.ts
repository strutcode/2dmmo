type ConnectionCallback = (socket: FakeSocket) => void

export default class FakeSocket {
  private static callbacks: ConnectionCallback[] = []

  constructor() {}

  public static onConnection(callback: ConnectionCallback) {
    this.callbacks.push(callback)
  }

  public onClientAdd?: (type: string, id: string, props: any) => void
  public onClientUpdate?: (type: string, id: string, props: any) => void

  public connect() {
    FakeSocket.callbacks.forEach(func => func(this))
  }
}
