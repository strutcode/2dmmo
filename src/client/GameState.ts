import Mobile from './entities/Mobile'

export default class GameState {
  public self?: Mobile
  public players = new Map<string, Mobile>()

  public setSelf(id: string) {
    this.self = new Mobile()
  }

  public addPlayer(id: string) {
    this.players.set(id, new Mobile())
  }

  public removePlayer(id: string) {
    this.players.delete(id)
  }

  public updatePlayer(id: string, change: Record<string, any | undefined>) {
    const player = this.players.get(id)

    if (player) {
      if (change.x) player.x = change.x
      if (change.y) player.y = change.y
    }
  }
}
