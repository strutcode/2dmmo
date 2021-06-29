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
        data.useQueue.push({
          cardId: Number(ev.dataTransfer?.getData('number')),
          windowX: ev.clientX,
          windowY: ev.clientY,
        })
      })
    }

    document.body.appendChild(this.container)
  }

  public update() {
    this.engine.with(CardData, (data) => {
      data.titles.forEach((title, i) => {
        if (!this.cards[i]) {
          const el = document.createElement('div')

          el.innerText = title
          el.draggable = true
          el.ondragstart = (ev) => {
            if (!ev.dataTransfer) return

            ev.dataTransfer.setData('number', String(i))
          }

          this.container.appendChild(el)
          this.cards[i] = el
        }
      })
    })
  }
}
