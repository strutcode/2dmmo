import Component from '../../../common/engine/Component'

type Item = {
  name: string
  icon: string
}

export default class Inventory extends Component {
  public tradeWindow = false
  public items: Item[] = [
    {
      name: 'Testing',
      icon: 'test',
    },
  ]
}
