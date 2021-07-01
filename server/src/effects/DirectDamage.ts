import BaseEffect from '../BaseEffect'
import Mobile from '../components/Mobile'

export default class DirectDamage extends BaseEffect {
  public params = {
    amount: {
      kind: 'integer',
      value: 10,
    },
    type: {
      kind: 'string',
      options: [
        'piercing',
        'slashing',
        'blunt',
        'fire',
        'cold',
        'electric',
        'acid',
        'arcane',
        'environmental',
      ],
      value: 'environmental',
    },
  }

  public start() {
    this.entity?.with(Mobile, (mob) => {
      mob.hp -= 10
    })

    this.destroy()
  }
}
