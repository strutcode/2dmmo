import GameState from '../GameState'
import Mobile from '../entities/Mobile'
import Observable from '../../common/Observable'

export default class Interface {
  public onTriggerInput = new Observable<(name: string) => void>()
  private wrapper = document.createElement('div')
  private names: HTMLDivElement[] = []
  // private boundUpdate = this.update.bind(this)
  // private run = true

  constructor(private state: GameState) {}

  public start() {
    this.wrapper.id = 'ui'
    const canvas = document.querySelector('canvas')

    if (canvas) {
      const rect = canvas.getBoundingClientRect()
      Object.assign(this.wrapper.style, {
        top: `${rect.top}px`,
        left: `${rect.left}px`,
        width: `${rect.width}px`,
        height: `${rect.height}px`,
      })
    }

    this.setupNameTags()
    this.setupButtons()

    document.body.appendChild(this.wrapper)

    // requestAnimationFrame(this.boundUpdate)
  }

  public stop() {
    this.wrapper.remove()
    // this.run = false
  }

  private setupNameTags() {
    const addNameTag = (player: Mobile) => {
      const el = document.createElement('div')

      el.id = player.name
      el.classList.add('nameTag')
      el.innerText = player.name

      this.positionOnCanvas(el, player.x * 16 + 8, player.y * 16 - 2)

      this.names.push(el)
      this.wrapper.appendChild(el)
    }

    this.state.players.forEach((player) => {
      addNameTag(player)
    })

    this.state.onPlayerAdd.observe((player) => {
      addNameTag(player)
    })

    this.state.onPlayerRemove.observe((player) => {
      const el = document.getElementById(player.name)

      if (el) el.remove()
    })

    this.state.onPlayerUpdate.observe((player) => {
      const el = document.getElementById(player.name)

      if (el) {
        this.positionOnCanvas(el, player.x * 16 + 8, player.y * 16 - 2)
      }
    })
  }

  public setupButtons() {
    const btnWrapper = document.createElement('div')

    btnWrapper.id = 'moveButtons'

    const directions = ['up', 'down', 'left', 'right']

    directions.forEach((name) => {
      const el = document.createElement('button')

      el.id = `dir-${name}`
      el.onclick = () => this.onTriggerInput.notify(name)

      btnWrapper.appendChild(el)
    })

    this.wrapper.appendChild(btnWrapper)
  }

  private positionOnCanvas(el: HTMLElement, x: number, y: number) {
    const size = this.wrapper.getBoundingClientRect()
    const top = y * (size.height / 208)
    const left = x * (size.width / 400)

    Object.assign(el.style, {
      position: 'absolute',
      top: `${top}px`,
      left: `${left}px`,
    })
  }

  // public update() {
  //   if (!this.run) return

  //   requestAnimationFrame(this.boundUpdate)
  // }
}
