import Component from '../../../common/engine/Component'

type CardUse = {
  cardId: number
  entityId?: number
  windowX: number
  windowY: number
  tileX?: number
  tileY?: number
}

export default class CardData extends Component {
  public titles: string[] = []
  public useQueue: CardUse[] = []
}
