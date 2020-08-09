import Mobile from './entities/Mobile'

export default class GameState {
  public self?: Mobile
  public players = new Map<string, Mobile>()

  public setSelf(id: string) {
    this.self = new Mobile('You')
  }

  public addPlayer(id: string, props: Record<string, any>) {
    this.players.set(id, new Mobile(id, props.x, props.y))
  }

  public removePlayer(id: string) {
    this.players.delete(id)
  }

  public updatePlayer(id: string, change: Record<string, any | undefined>) {
    const player = this.players.get(id)

    if (player) {
      player.teleport(change.x, change.y)
    }
  }
}
