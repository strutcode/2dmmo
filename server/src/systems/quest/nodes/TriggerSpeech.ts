import Node from '../Node'

export default class TriggerSpeech extends Node {
  public static get inputs() {
    return [
      {
        name: 'prev',
        type: 'Flow',
        label: '',
      },
      {
        name: 'match',
        type: 'Regex',
        label: 'Match',
      },
    ]
  }
}
