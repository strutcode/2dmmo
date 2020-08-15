import GameMap, { TileData } from './GameMap'

export type ToolType = 'pencil' | 'fill' | 'select'

export default class EditorState {
  public currentMap?: GameMap | null = null
  public selectedTile?: TileData | null = null
  public currentTool: ToolType = 'fill'

  public createMap() {
    this.currentMap = new GameMap()
  }

  public selectTile(set: string, x: number, y: number) {
    this.selectedTile = { x, y, set }
  }
}
