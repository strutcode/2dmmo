import BaseEffect from '../BaseEffect'
import DirectDamage from './DirectDamage'

export default class DamageReduction extends BaseEffect {
  public added(effect: BaseEffect) {
    if (effect instanceof DirectDamage) {
      effect.params.amount.value /= 2
    }
  }
}
