import Engine from './Engine'

export default class System {
  public constructor(protected engine: Engine) {
    this.start()
  }

  public start() {}

  public update() {}
}
