import System from '../../../common/engine/System'
import Inventory from '../components/Inventory'

export default class Trade extends System {
  protected dialog = document.createElement('div')
  protected title = document.createElement('div')
  protected list = document.createElement('div')

  public start() {
    this.dialog.id = 'tradeWindow'

    this.title.classList.add('title')
    this.title.innerText = 'Choose an item to trade'
    this.dialog.appendChild(this.title)

    this.list.classList.add('list')
    this.dialog.appendChild(this.list)

    document.body.appendChild(this.dialog)
  }

  public update() {
    this.engine.forEachUpdated(Inventory, (inv) => {
      this.loadItems(inv)
    })
  }

  protected loadItems(inventory: Inventory) {
    this.list.innerHTML = ''

    inventory.items.forEach((item) => {
      const div = document.createElement('div')
      div.innerText = item.name
      this.list.appendChild(div)
    })
  }
}
