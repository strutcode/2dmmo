import { performance } from 'perf_hooks'
import Component from '../../../common/engine/Component'

type InputAction = {
  time: number
  action: string
}

/** A component that allows the entity to accept input */
export default class Input extends Component {
  /** A queue of inputs to be processed */
  public inputs: InputAction[] = []

  /** Adds an input to the processing queue */
  public addInput(action: string, time = performance.now()) {
    this.inputs.push({
      action,
      time,
    })
  }
}
