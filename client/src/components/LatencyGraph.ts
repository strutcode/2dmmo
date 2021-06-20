import Component from '../../../common/engine/Component'

/** Data storage for the latency graph */
export default class LatencyGraph extends Component {
  /** Latency records in ms */
  public history: number[] = []

  /** Adds a latency record in ms */
  public logLatency(latencyInMs: number) {
    this.history.push(latencyInMs)
  }

  /** A time relevant window of latency values */
  public get historyWindow() {
    return this.history.slice(-50)
  }
}
