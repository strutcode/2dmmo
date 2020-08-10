import GameState from '../GameState'
import Mobile from '../entities/Mobile'
import Observable from '../../common/Observable'

export default class Interface {
  public onTriggerInput = new Observable<(name: string) => void>()

  private wrapper = document.createElement('div')
  private names: HTMLDivElement[] = []
  private boundMatchCanvas = this.matchCanvas.bind(this)
  // private boundUpdate = this.update.bind(this)
  // private run = true

  constructor(private state: GameState) { }

  public start() {
    this.wrapper.id = 'ui'

    this.matchCanvas()
    this.setupNameTags()
    this.setupButtons()

    document.body.appendChild(this.wrapper)
    window.addEventListener('resize', this.boundMatchCanvas)

    // requestAnimationFrame(this.boundUpdate)
  }

  public stop() {
    window.removeEventListener('resize', this.boundMatchCanvas)
    this.wrapper.remove()
    // this.run = false
  }

  private matchCanvas() {
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

    document.querySelectorAll('.nameTag').forEach(el => {
      if (el instanceof HTMLElement) {
        const mob = el.mob
        this.positionOnCanvas(el, mob.x * 16 + 8, mob.y * 16 - 2)
      }
    })
  }

  private setupNameTags() {
    const addNameTag = (mob: Mobile) => {
      console.log('add nametag', mob.x, mob.y, mob)
      const el = document.createElement('div')

      el.id = mob.id
      el.classList.add('nameTag')
      el.innerText = mob.name
        ; (el as any).mob = mob

      this.positionOnCanvas(el, mob.x * 16 + 8, mob.y * 16 - 2)

      this.names.push(el)
      this.wrapper.appendChild(el)
    }

    this.state.mobs.forEach((mob) => {
      addNameTag(mob)
    })

    this.state.onMobileAdd.observe((mob) => {
      addNameTag(mob)
    })

    this.state.onMobileRemove.observe((mob) => {
      const el = document.getElementById(mob.name)

      if (el) el.remove()
    })

    this.state.onMobileUpdate.observe((mob) => {
      const el = document.getElementById(mob.id)

      if (el) {
        this.positionOnCanvas(el, mob.x * 16 + 8, mob.y * 16 - 2)
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
