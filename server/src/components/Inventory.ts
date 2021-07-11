import Component from '../../../common/engine/Component'
import Item from './Item'

export default class Inventory extends Component {
  public items: Item[] = []
  public cards: ActionCard[] = []
}
