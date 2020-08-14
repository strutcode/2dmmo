import Mobile from './Mobile'
import { tileDistance } from '../../common/util/Geometry'

export default class Battle {
  private intervals: NodeJS.Timeout[] = []

  public constructor(mob1: Mobile, mob2: Mobile) {
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
  }
}
