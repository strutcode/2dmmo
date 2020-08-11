import Observable from '../../common/Observable'
import Player from '../entities/Player'

interface ChangeList {
  added: Player[]
  removed: Player[]
}

export default class NetworkScope {
  public onChange = new Observable<(id: string, changes: ChangeList) => void>()
  public onUpdate = new Observable<(id: string, changed: Player) => void>()

  private players: Player[] = []
  private mobs: Player[] = []

  public addPlayer(player: Player) {
    this.onChange.notify(player.id, {
      added: this.players,
      removed: [],
    })

    this.players.forEach((other) => {
      this.onChange.notify(other.id, {
        added: [player],
        removed: [],
      })
    })

    player.onMove.observe(() => {
      this.players.forEach((other) => {
        this.onUpdate.notify(other.id, player)
      })
    })

    this.players.push(player)
  }

  public removePlayer(player: Player) {
    this.players = this.players.filter((p) => p !== player)

    this.players.forEach((other) => {
      this.onChange.notify(other.id, {
        added: [],
        removed: [player],
      })
    })
  }
}
