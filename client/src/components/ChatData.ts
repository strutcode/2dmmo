import Component from '../../../common/engine/Component'

export default class ChatData extends Component {
  public focused = false
  public incoming: string[] = []
  public outgoing: string[] = []
  public history: string[] = []
}
