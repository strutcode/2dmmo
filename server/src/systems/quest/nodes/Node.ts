type NodeSocket = {
  name: string
  type: string
  label: string
}

export default class Node {
  public static get inputs(): NodeSocket[] {
    return [
      {
        name: 'prev',
        type: 'Flow',
        label: '',
      },
    ]
  }

  public static get outputs(): NodeSocket[] {
    return [
      {
        name: 'next',
        type: 'Flow',
        label: '',
      },
    ]
  }

  public execute() {}
}
