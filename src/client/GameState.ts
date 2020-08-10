import Mobile from './entities/Mobile'
import Observable from '../common/Observable'

let id = 0
export default class GameState {
  public self?: Mobile
  public mobs = new Map<string, Mobile>()

  public onMobileAdd = new Observable<(mob: Mobile) => void>()
  public onMobileRemove = new Observable<(mob: Mobile) => void>()
  public onMobileUpdate = new Observable<(mob: Mobile) => void>()

  public setSelf(id: string) {
    this.self = this.addMobile(id, {})
  }

  public addMobile(id: string, props: Record<string, any>) {
    const mob = new Mobile(id, props.name, props.x, props.y)

    if (props.sprite) mob.sprite = props.sprite
    this.mobs.set(id, mob)
    this.onMobileAdd.notify(mob)

    return mob
  }

  public removeMobile(id: string) {
    const mob = this.mobs.get(id)

    if (mob) {
      this.mobs.delete(id)
      this.onMobileRemove.notify(mob)
    }
  }

  public updateMobile(id: string, change: Record<string, any | undefined>) {
    const mob = this.mobs.get(id)

    if (mob) {
      mob.teleport(change.x, change.y)
      this.onMobileUpdate.notify(mob)
    }
  }
}
