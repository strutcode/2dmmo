import System from '../../../common/engine/System'
import InputQueue from '../components/InputQueue'
import Inventory from '../components/Inventory'

export default class Trade extends System {
  protected dialog = document.createElement('div')
  protected title = document.createElement('div')
  protected list = document.createElement('div')

  public start() {
    this.dialog.id = 'tradeWindow'
    this.dialog.style.display = 'none'

    this.title.classList.add('title')
    this.title.innerText = 'Choose an item to trade'
    this.dialog.appendChild(this.title)

    this.list.classList.add('list')
    this.dialog.appendChild(this.list)

    document.body.appendChild(this.dialog)
  }

  public update() {
    this.engine.with(InputQueue, (input) => {
      input.actions.forEach((action, i) => {
        input.entity.with(Inventory, (inv) => {
          if (action === 'trade') {
            inv.tradeWindow = true
            input.actions.splice(i, 1)
          } else if (action === 'cancel' && inv.tradeWindow) {
            inv.tradeWindow = false
            input.actions.splice(i, 1)
          }
        })
      })
    })

    this.engine.forEachUpdated(Inventory, (inv) => {
      if (inv.tradeWindow) {
        this.loadItems(inv)
      } else {
        this.dialog.style.display = 'none'
      }
    })
  }

  protected loadItems(inventory: Inventory) {
    this.dialog.style.display = 'block'
    this.list.innerHTML = ''

    inventory.items.forEach((item) => {
      const div = document.createElement('div')
      div.innerText = item.name
      this.list.appendChild(div)
    })
  }
}
