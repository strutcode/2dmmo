import Node from '../Node'

export default class SceneStart extends Node {
  public static get inputs() {
    return []
  }

  public execute() {
    return {
      next: true,
    }
  }
}
