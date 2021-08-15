import Link from './Link'

type NodeSocket = {
  name: string
  type: string
  label: string
}

type NodeValue = NodeSocket

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

  public static get values(): NodeValue[] {
    return []
  }

  public connections: Record<string, Link[]> = {}

  public constructor(protected data: any) {}

  public get name() {
    return this.constructor.name
  }

  public get inputs(): NodeSocket[] {
    return (this.constructor as typeof Node).inputs
  }

  public get outputs(): NodeSocket[] {
    return (this.constructor as typeof Node).outputs
  }

  public get values(): NodeSocket[] {
    return (this.constructor as typeof Node).values
  }

  public execute(
    context: any,
    inputs: Record<string, unknown>,
  ): Record<string, unknown> {
    return {}
  }
}
