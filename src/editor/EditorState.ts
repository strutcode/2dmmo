import GameMap from './GameMap'

export default class EditorState {
  public currentMap?: GameMap

  public createMap() {
    this.currentMap = new GameMap()
  }
}
