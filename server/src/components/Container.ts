import Component from '../../../common/engine/Component'
import Item from '../Item'

enum ContainerType {
  Endo,
  Exo,
}

export default class Container extends Component {
  public internalItems: Item[] = []
  public externalItems: Item[] = []
  public deck: ActionCard[] = []
  public hand: ActionCard[] = []
}
