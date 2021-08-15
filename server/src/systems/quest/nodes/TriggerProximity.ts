import TilePosition from '../../../../../common/components/TilePosition'
import Mobile from '../../../components/Mobile'
import { distanceChebyshev } from '../../../util/Geometry'
import QuestInstance from '../QuestInstance'
import Trigger from '../Trigger'

export default class TriggerProximity extends Trigger {
  public static get inputs() {
    return [
      {
        name: 'prev',
        type: 'Flow',
        label: '',
      },
      {
        name: 'from',
        type: 'Mobile',
        label: 'From',
      },
      {
        name: 'to',
        type: 'Mobile',
        label: 'To',
      },
      {
        name: 'distance',
        type: 'Number',
        label: 'Distance (ft)',
      },
    ]
  }

  public execute(context: QuestInstance, inputs: any) {
    const from: Mobile = inputs.from
    const to: Mobile = inputs.to
    const distance = Math.round(inputs.distance / 10)
    let next = false

    if (from && to && distance != null) {
      from.entity.with(TilePosition, (posA) => {
        to.entity.with(TilePosition, (posB) => {
          if (distanceChebyshev(posA, posB) <= distance) {
            next = true
          }
        })
      })
    }

    return {
      next,
    }
  }
}
