import Component from '../../../common/engine/Component'

type Card = {
  id: string
  title: string
}

type CardUse = {
  cardId: string
  entityId?: number
  windowX: number
  windowY: number
  tileX?: number
  tileY?: number
}

export default class CardData extends Component {
  public cards: Card[] = []
  public useQueue: CardUse[] = []
}
