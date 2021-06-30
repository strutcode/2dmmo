import BaseEffect from '../BaseEffect'
import Mobile from '../components/Mobile'

export default class InstantDamage extends BaseEffect {
  public add() {
    this.entity.with(Mobile, (mob) => {
      mob.hp -= 10
    })
    this.destroy()
  }
}
