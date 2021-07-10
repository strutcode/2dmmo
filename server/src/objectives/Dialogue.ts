import BaseObjective from '../BaseObjective'

export default class TalkTo extends BaseObjective {
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
