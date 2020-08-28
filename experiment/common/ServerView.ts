import FakeSocket from './FakeSocket'
import NetworkSync from './NetworkSync'

export default class ServerView {
  constructor(public socket: FakeSocket) {}

  public sync(input: any) {
    NetworkSync.bindView(input, this)
  }

  public unsync(input: any) {}

  public add(type: string, id: string, props: any) {
    if (this.socket.onClientAdd) {
      this.socket.onClientAdd(type, id, JSON.stringify(props))
    }
  }

  public update(type: string, id: string, props: any) {
    if (this.socket.onClientUpdate) {
      this.socket.onClientUpdate(type, id, JSON.stringify(props))
    }
  }
}
