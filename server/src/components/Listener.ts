import Component from '../../../common/engine/Component'

interface Message {
  type: 'say'
  speaker: number
  words: string
}

export default class Listener extends Component {
  public history: Message[] = []
  public incoming: Message[] = []

  public hear(speaker: number, words: string) {
    this.incoming.push({
      type: 'say',
      speaker,
      words,
    })
  }
}
