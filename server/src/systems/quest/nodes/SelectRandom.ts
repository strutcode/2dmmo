import Node from '../Node'

export default class SelectRandom extends Node {
  public static get outputs() {
    return [
      {
        name: '1',
        type: 'Flow',
        label: '',
      },
      {
        name: '2',
        type: 'Flow',
        label: '',
      },
      {
        name: '3',
        type: 'Flow',
        label: '',
      },
      {
        name: '4',
        type: 'Flow',
        label: '',
      },
      {
        name: '5',
        type: 'Flow',
        label: '',
      },
    ]
  }

  public execute() {
    const options: string[] = []

    this.outputs.forEach((output) => {
      if (this.connections[output.name]) {
        options.push(output.name)
      }
    })

    const selected = options[Math.floor(Math.random() * options.length)]

    return {
      [selected]: true,
    }
  }
}
