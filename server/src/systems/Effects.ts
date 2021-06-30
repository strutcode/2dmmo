import System from '../../../common/engine/System'
import Affectable from '../components/Affectable'
import Mobile from '../components/Mobile'

export default class Effects extends System {
  public update() {
    this.engine.forEachComponent(Affectable, (affectable) => {
      // Handle newly added effects
      affectable.added.forEach((effect, i) => {
        effect.start()

        affectable.active.forEach((otherEffect) => otherEffect.added(effect))

        affectable.added.splice(i, 1)
        affectable.active.push(effect)
      })

      // Handle currently active effects
      affectable.active.forEach((effect) => effect.tick())

      // Handle recently removed effects
      affectable.removed.forEach((effect, i) => {
        effect.end()

        affectable.active.forEach((otherEffect) => otherEffect.removed(effect))

        affectable.added.splice(i, 1)
      })
    })

    this.engine.forEachComponent(Mobile, (mob) => {
      if (mob.hp <= 0) {
        this.engine.destroyEntity(mob.entity)
      }
    })
  }
}
