import BaseObjective from '../BaseObjective'

export default class Dialogue extends BaseObjective {
  public params = {
    who: {
      kind: 'mobile',
      required: true,
    },
    dialogue: {
      kind: 'dialogue',
      required: true,
    },
  }
}
