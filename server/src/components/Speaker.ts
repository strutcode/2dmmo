import Component from '../../../common/engine/Component'

export default class Speaker extends Component {
  public outgoing: string[] = []

  public say(words: string) {
    this.outgoing.push(words)
  }
}
