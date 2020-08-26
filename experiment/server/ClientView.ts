import FakeSocket from '../common/FakeSocket'
import NetworkSync from '../common/NetworkSync'

export default class ClientView {
  private monitored = new Set<string>()

  constructor(public socket: FakeSocket) {}

  public add(input: any) {
    NetworkSync.bindView(input, this)
  }

  public has(input: any) {
    const id =
      typeof input === 'string' ? input : NetworkSync.objectMap.get(input)

    return this.monitored.has(id ?? '')
  }
}
