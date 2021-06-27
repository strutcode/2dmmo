import Component from '../../../common/engine/Component'

interface Card {
  name: string
  action: string
}

export default class Inventory extends Component {
  public cards: Card[] = [
    { name: 'Stabbity stab', action: 'attack' },
    { name: 'Blocky block', action: 'defend' },
    { name: 'Reason with them', action: 'charm' },
  ]
}
