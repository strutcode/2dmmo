import Component from '../../../common/engine/Component'

/** Records player inputs for processing */
export default class InputQueue extends Component {
  /** A list of virtual "actions" already mapped from key presses */
  public actions: string[] = []

  /** Add a virtual "action" */
  public addAction(name: string) {
    this.actions.push(name)
  }
}
