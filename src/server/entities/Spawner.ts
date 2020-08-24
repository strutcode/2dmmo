import Enemy, { EnemyOptions } from './Enemy'

import Observable from '../../common/Observable'

let gid = 0
export default class Spawner {
  public onSpawn = new Observable<(mob: Enemy) => void>()
  private id = gid++
  private uid = 0
  private mobs: Enemy[] = []

  public constructor(
    private area: [number, number, number, number],
    private limit: number,
    private template: EnemyOptions,
  ) {}

  public seed(map: Record<string, any>) {
    for (let i = 0; i < this.limit; i++) {
      this.update(map)
    }
  }

  public update(map: Record<string, any>) {
    if (this.mobs.length >= this.limit) return

    const minX = this.area[0]
    const minY = this.area[1]
    const maxX = this.area[2] - this.area[0]
    const maxY = this.area[3] - this.area[1]
    let x = Math.floor(minX + Math.random() * maxX)
    let y = Math.floor(minY + Math.random() * maxY)

    const walkable = (x: number, y: number) =>
      map.layers.find(
        (l: any) => l.data[y] && l.data[y][x] && l.data[y][x].walkable,
      )

    for (let i = 0; !walkable(x, y) && i < 100; i++) {
      x = Math.floor(minX + Math.random() * maxX)
      y = Math.floor(minY + Math.random() * maxY)
    }

    if (walkable(x, y)) {
      const mob = new Enemy(`${this.id}_${this.uid++}`, map, {
        ...this.template,
        x,
        y,
      })

      mob.onDestroy.observe(() => {
        this.mobs = this.mobs.filter(m => m !== mob)
      })

      this.onSpawn.notify(mob)

      this.mobs.push(mob)
    }
  }
}
