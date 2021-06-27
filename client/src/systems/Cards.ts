import System from '../../../common/engine/System'
import CardData from '../components/CardData'

export default class Cards extends System {
  private container = document.createElement('div')
  private cards: HTMLDivElement[] = []

  public start() {
    this.container.id = 'cards'

    document.body.appendChild(this.container)
  }

  public update() {
    this.engine.with(CardData, (data) => {
      data.titles.forEach((title, i) => {
        if (!this.cards[i]) {
          const el = document.createElement('div')

          el.innerText = title

          this.container.appendChild(el)
          this.cards[i] = el
        }
      })
    })
  }
}
