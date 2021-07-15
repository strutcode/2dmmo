import BaseObjective from '../BaseObjective'

export default class ReceiveItems extends BaseObjective {
  public params = {
    who: {
      kind: 'mobile',
      required: true,
      value: null,
    },
    items: {
      kind: 'item',
      required: true,
      value: null,
    },
    from: {
      kind: 'mobile',
      required: true,
      value: null,
    },
  }
}
