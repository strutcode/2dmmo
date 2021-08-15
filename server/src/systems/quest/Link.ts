import Node from './Node'

export default class Link {
  public constructor(
    public sourceNode: Node,
    public sourceSocket: string,
    public targetNode: Node,
    public targetSocket: string,
  ) {}
}
