import Node from './Node'

export default class TriggerProximity extends Node {
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
}
