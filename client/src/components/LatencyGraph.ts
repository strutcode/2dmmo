import Component from '../../../common/engine/Component'

export default class LatencyGraph extends Component {
  public history: number[] = []

  public logLatency(latencyInMs: number) {
    this.history.push(latencyInMs)
  }

  public get historyWindow() {
    return this.history.slice(-50)
  }
}
