import Mobile, { MobileOptions } from './Mobile'

export interface EnemyOptions extends MobileOptions {
  ai?: (this: Mobile) => void
  aiDelay?: number
}

const noop = () => {}

export default class Enemy extends Mobile {
  private ai: (this: Mobile) => void
  private aiDelay: number

  constructor(id: string, options: EnemyOptions) {
    super(id, options)

    this.ai = options.ai ?? noop
    this.aiDelay = options.aiDelay ?? 5000

    // TODO: cleanup
    setInterval(() => {
      this.ai.call(this)
    }, this.aiDelay)
  }
}
