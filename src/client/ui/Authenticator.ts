import Observable from '../../common/Observable'

export default class Authenticator {
  public onDone = new Observable()

  private el = document.createElement('div')

  public constructor() {}

  public start() {
    this.setupUi()
    this.testAuthentication()
  }

  public stop() {
    this.el.remove()
  }

  private setupUi() {
    this.el.id = 'auth'

    this.el.innerHTML = `
      <div id="welcome">
        <div>Welcome to 2DMMO!</div>
        <div class="login"></div>
      </div>
    `

    const form = document.createElement('form')

    form.innerHTML = `
      <input name="username" />
      <input name="password" type="password" />
      <button>Login</button>
    `

    form.addEventListener('submit', async ev => {
      ev.preventDefault()
      ev.stopPropagation()

      if (ev.target instanceof HTMLFormElement) {
        const formData = new FormData(ev.target)
        const body: Record<string, any> = {}

        formData.forEach((val, key) => {
          body[key] = val
        })

        const res = await fetch('/auth', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(body),
        })

        if (res.ok && res.status === 200) {
          this.onDone.notify()
        }
      }
    })

    this.el.querySelector('.login')?.appendChild(form)
    document.body.appendChild(this.el)
  }

  private async testAuthentication() {
    const res = await fetch('/auth')

    if (res.ok && res.status === 200) {
      this.onDone.notify()
    }
  }
}
