import Node from '../Node'
import QuestInstance from '../QuestInstance'

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
