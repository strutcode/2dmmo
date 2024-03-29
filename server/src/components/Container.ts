import Component from '../../../common/engine/Component'
import Item from './Item'

export default class Container extends Component {
  public updated = false
  public internalItems: Item[] = []
  public externalItems: Item[] = []
  public deck: ActionCard[] = []
  public hand: ActionCard[] = []
}
