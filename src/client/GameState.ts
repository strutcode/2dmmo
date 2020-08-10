import Mobile from './entities/Mobile'
import Observable from '../common/Observable'

let id = 0
export default class GameState {
  public self?: Mobile
  public players = new Map<string, Mobile>()
  public mobs = new Map<string, Mobile>()

  public onPlayerAdd = new Observable<(player: Mobile) => void>()
  public onPlayerRemove = new Observable<(player: Mobile) => void>()
  public onPlayerUpdate = new Observable<(player: Mobile) => void>()
  public onMobileAdd = new Observable<(mob: Mobile) => void>()
  public onMobileRemove = new Observable<(mob: Mobile) => void>()
  public onMobileUpdate = new Observable<(mob: Mobile) => void>()

  public setSelf(id: string) {
    this.self = new Mobile(id, 'You')
  }

  public addPlayer(id: string, props: Record<string, any>) {
    const player = new Mobile(id, 'Soandso', props.x, props.y)
    this.players.set(id, player)
    this.onPlayerAdd.notify(player)
  }

  public removePlayer(id: string) {
    const player = this.players.get(id)

    if (player) {
      this.players.delete(id)
      this.onPlayerRemove.notify(player)
    }
  }

  public updatePlayer(id: string, change: Record<string, any | undefined>) {
    const player = this.players.get(id)

    if (player) {
      player.teleport(change.x, change.y)
      this.onPlayerUpdate.notify(player)
    }
  }

  public addMob(sprite: string, name: string) {
    const mob = new Mobile(String(id++), name, 1, 1)
    mob.sprite = sprite

    this.mobs.set(mob.id, mob)
    this.onMobileAdd.notify(mob)
  }
}
