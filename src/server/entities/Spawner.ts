import Enemy, { EnemyOptions } from './Enemy'

import Observable from '../../common/Observable'

let gid = 0
export default class Spawner {
  public onSpawn = new Observable<(mob: Enemy) => void>()
  private id = gid++
  private uid = 0
  private mobs: Enemy[] = []

  constructor(
    private area: [number, number, number, number],
    private limit: number,
    private template: EnemyOptions,
  ) {
    setTimeout(() => {
      for (let i = 0; i < this.limit; i++) {
        this.update()
      }
    })
  }

  update() {
    const minX = this.area[0]
    const minY = this.area[1]
    const maxX = this.area[2] - this.area[0]
    const maxY = this.area[3] - this.area[1]

    if (this.mobs.length > this.limit) return

    const mob = new Enemy(`${this.id}_${this.uid++}`, {
      ...this.template,
      x: Math.floor(minX + Math.random() * maxX),
      y: Math.floor(minY + Math.random() * maxY),
    })

    mob.onDestroy.observe(() => {
      this.mobs = this.mobs.filter(m => m !== mob)
    })

    this.onSpawn.notify(mob)

    this.mobs.push(mob)
  }
}
