import System from '../../../common/engine/System'
import CardData from '../components/CardData'

export default class Cards extends System {
  private container = document.createElement('div')
  private cards: HTMLDivElement[] = []

  public start() {
    this.container.id = 'cards'

    document.body.ondragover = (ev) => {
      ev.preventDefault()
      return false
    }
    document.body.ondrop = (ev) => {
      this.engine.with(CardData, (data) => {
        const cardId = ev.dataTransfer?.getData('string')

        if (cardId) {
          data.useQueue.push({
            cardId,
            windowX: ev.clientX,
            windowY: ev.clientY,
          })
        }
      })
    }

    document.body.appendChild(this.container)
  }

  public update() {
    this.engine.with(CardData, (data) => {
      data.cards.forEach((card, i) => {
        if (!this.cards[i]) {
          const el = document.createElement('div')

          el.innerText = card.title
          el.draggable = true
          el.ondragstart = (ev) => {
            if (!ev.dataTransfer) return

            ev.dataTransfer.setData('string', String(card.id))
          }

          this.container.appendChild(el)
          this.cards[i] = el
        }
      })
    })
  }
}
