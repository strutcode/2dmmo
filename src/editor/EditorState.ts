import GameMap, { TileData } from './GameMap'

export type ToolType = 'pencil' | 'fill' | 'select'
export type ModKeys = {
  ctrl: boolean
  alt: boolean
  shift: boolean
}

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

  public onClick(x: number, y: number, mod: ModKeys) {
    if (this.currentTool === 'pencil') {
      if (this.currentMap && this.selectedTile) {
        this.currentMap.setTile(x, y, this.selectedTile)
      }
    }
  }

  public onDrag(x: number, y: number, mod: ModKeys) {
    if (this.currentTool === 'pencil') {
      if (this.currentMap && this.selectedTile) {
        this.currentMap.setTile(x, y, this.selectedTile)
      }
    }
  }

  public onDrop(x: number, y: number, mod: ModKeys) {}
}
