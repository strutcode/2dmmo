import Mobile from './Mobile'
import { tileDistance } from '../../common/util/Geometry'

export default class Battle {
  public static all: Battle[] = []

  private intervals: NodeJS.Timeout[] = []

  public constructor(protected mob1: Mobile, protected mob2: Mobile) {
    if (Battle.all.find((b) => b.mob1 === mob1 && b.mob2 === mob2)) {
      log.out('Combat', `Already in combat: ${mob1.id} ${mob2.id}`)
      return
    }

    log.out('Combat', `Starting combat between ${mob1.name} and ${mob2.name}`)
    const initiative = Math.random()

    if (initiative < 0.5) {
      this.fight(mob1, mob2)

      this.intervals.push(setInterval(() => this.fight(mob2, mob1), 1500))
      setTimeout(() => {
        this.intervals.push(setInterval(() => this.fight(mob1, mob2), 1500))
      }, 750)
    } else {
      this.intervals.push(setInterval(() => this.fight(mob1, mob2), 1500))
      setTimeout(() => {
        this.intervals.push(setInterval(() => this.fight(mob2, mob1), 1500))
      }, 750)
      this.fight(mob2, mob1)
    }

    Battle.all.push(this)
  }

  private fight(tori: Mobile, uke: Mobile) {
    if (tileDistance(tori.x, tori.y, uke.x, uke.y) <= 1) {
      log.out(
        'Combat',
        `${tori.name} hit ${uke.name} for ${tori.strength} damage`,
      )
      uke.damage(tori, tori.strength)

      if (uke.hp <= 0) {
        log.out('Combat', `${tori.name} killed ${uke.name}`)
        this.end()
      }
    }
  }

  public end() {
    this.intervals.map(clearInterval)
    Battle.all = Battle.all.filter((b) => b !== this)
  }
}
