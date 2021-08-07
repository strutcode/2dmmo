type NodeSocket = {
  name: string
  type: string
  label: string
}

export default class Node {
  public static get inputs(): NodeSocket[] {
    return []
  }

  public static get outputs(): NodeSocket[] {
    return []
  }

  public execute() {}
}
