import { performance } from 'perf_hooks'
import Component from '../../../common/engine/Component'

type InputAction = {
  time: number
  action: string
}

type CardAction = {
  id: string
  target?: number
}

/** A component that allows the entity to accept input */
export default class Input extends Component {
  /** A queue of inputs to be processed */
  public inputs: InputAction[] = []

  /** A queue of card uses to be processed */
  public useQueue: CardAction[] = []

  /** Adds an input to the processing queue */
  public addInput(action: string, time = performance.now()) {
    this.inputs.push({
      action,
      time,
    })
  }

  /** Adds a card to the processing queue */
  public useCard(id: string, target?: number) {
    this.useQueue.push({ id, target })
  }
}
