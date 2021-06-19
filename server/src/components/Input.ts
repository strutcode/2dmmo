import { performance } from 'perf_hooks'
import Component from '../../../common/engine/Component'

type InputAction = {
  time: number
  action: string
}

export default class Input extends Component {
  public inputs: InputAction[] = []

  public addInput(action: string, time = performance.now()) {
    this.inputs.push({
      action,
      time,
    })
  }
}
