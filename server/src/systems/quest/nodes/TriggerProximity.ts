import Node from './Node'

export default class TriggerProximity extends Node {
  public static get inputs() {
    return [
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
