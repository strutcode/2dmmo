import Component from '../../../common/engine/Component'

export default class ChatData extends Component {
  public incoming: string[] = []
  public outgoing: string[] = []
  public history: string[] = []
}
