import GameState from '../GameState'
import Mobile from '../entities/Mobile'
import Observable from '../../common/Observable'

export default class Interface {
  public onTriggerInput = new Observable<(name: string) => void>()

  private wrapper: HTMLDivElement = document.createElement('div')
  private names: HTMLDivElement[] = []
  private boundMatchCanvas = this.matchCanvas.bind(this)
  // private boundUpdate = this.update.bind(this)
  // private run = true

  constructor(private state: GameState) {}

  public start() {
    this.wrapper = document.createElement('div')
    this.wrapper.id = 'ui'

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

  public reset() {
    this.stop()
    this.start()
  }

  private matchCanvas() {
    const canvas = document.querySelector('canvas')
  }

  public setupButtons() {
    const btnWrapper = document.createElement('div')

    btnWrapper.id = 'moveButtons'

    const directions = ['up', 'left', 'right', 'down']

    directions.forEach((name) => {
      const el = document.createElement('button')

      el.id = `dir-${name}`
      el.onclick = () => this.onTriggerInput.notify(name)

      btnWrapper.appendChild(el)
    })

    this.wrapper.appendChild(btnWrapper)
  }

  private positionOnCanvas(el: HTMLElement, x: number, y: number) {
    const canvasEl = document.querySelector('canvas')

    if (!canvasEl) return

    const canvas = canvasEl.getBoundingClientRect()
    const ui = this.wrapper.getBoundingClientRect()
    const canvasPx = {
      x: canvas.width / canvasEl.width,
      y: canvas.height / canvasEl.width,
    }

    const top = y * canvasPx.y + (canvas.y - ui.y)
    const left = x * canvasPx.x + (canvas.x - ui.x)

    Object.assign(el.style, {
      position: 'absolute',
      top: `${top}px`,
      left: `${left}px`,
    })
  }
}
