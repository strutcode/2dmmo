import Component from '../../../common/engine/Component'

export default class InputQueue extends Component {
  public actions: string[] = []

  public addAction(name: string) {
    this.actions.push(name)
  }
}
