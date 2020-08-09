import Mobile from './entities/Mobile'
import Observable from '../common/Observable'

export default class GameState {
  public self?: Mobile
  public players = new Map<string, Mobile>()

  public onPlayerAdd = new Observable<(player: Mobile) => void>()
  public onPlayerRemove = new Observable<(player: Mobile) => void>()
  public onPlayerUpdate = new Observable<(player: Mobile) => void>()

  public setSelf(id: string) {
    this.self = new Mobile('You')
  }

  public addPlayer(id: string, props: Record<string, any>) {
    const player = new Mobile(id, props.x, props.y)
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
}
