import Mobile from '../entities/Mobile'
import Observable from '../../common/Observable'

interface ChangeList {
  added?: Mobile[]
  updated?: Mobile[]
  removed?: Mobile[]
}

export default class NetworkScope {
  public onChange = new Observable<(id: string, change: ChangeList) => void>()

  private mobs: Mobile[] = []

  public addMobile(mob: Mobile) {
    if (this.mobs.length) {
      this.onChange.notify(mob.id, {
        added: this.mobs,
      })
    }

    this.mobs.forEach((other) => {
      this.onChange.notify(other.id, {
        added: [mob],
      })
    })

    mob.onMove.observe(() => {
      this.mobs.forEach((other) => {
        this.onChange.notify(other.id, {
          updated: [mob],
        })
      })
    })

    this.mobs.push(mob)
  }

  public updateMobile(mob: Mobile) { }

  public removeMobile(mob: Mobile) {
    this.mobs = this.mobs.filter((m) => m !== mob)

    this.mobs.forEach((other) => {
      this.onChange.notify(other.id, {
        removed: [mob],
      })
    })
  }
}
