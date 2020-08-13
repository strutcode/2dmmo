import Mobile, { MobileOptions } from './Mobile'

export interface EnemyOptions extends MobileOptions {
  ai?: (this: Enemy, state: Record<string, any>) => void
  aiDelay?: number
}

const noop = () => {}

export default class Enemy extends Mobile {
  private ai: (this: Enemy, state: Record<string, any>) => void
  private aiDelay: number
  private aiInt?: ReturnType<typeof setInterval>
  private state: Record<string, any> = {}

  constructor(id: string, options: EnemyOptions) {
    super(id, options)

    this.ai = options.ai ?? noop
    this.aiDelay = options.aiDelay ?? 5000

    this.aiInt = setInterval(() => {
      this.ai.call(this, this.state)
    }, this.aiDelay)
  }

  public setState(key: string, value: any) {
    this.state[key] = value
  }

  public kill() {
    if (this.aiInt) clearInterval(this.aiInt)
    this.ai = noop

    super.kill()
  }
}