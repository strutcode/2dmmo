import GameMap, { TileData } from './GameMap'

export type ToolType = 'pencil' | 'fill' | 'select'
export type ModKeys = {
  ctrl: boolean
  alt: boolean
  shift: boolean
}

export interface Selection {
  startX: number
  startY: number
  x: number
  y: number
  w: number
  h: number
}

export default class EditorState {
  public currentMap: GameMap | null = null
  public selectedTile: TileData | null = null
  public currentTool: ToolType = 'select'

  public selection: Selection | null = null

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
    } else if (this.currentTool === 'select') {
      this.startSelection(x, y)
    } else if (this.currentTool === 'fill') {
    }
  }

  public onDrag(x: number, y: number, mod: ModKeys) {
    if (this.currentTool === 'pencil') {
      if (this.currentMap && this.selectedTile) {
        this.currentMap.setTile(x, y, this.selectedTile)
      }
    } else if (this.currentTool === 'select') {
      if (this.selection) {
        this.updateSelection(
          Math.min(x, this.selection.startX),
          Math.min(y, this.selection.startY),
          Math.abs(this.selection.startX - x) + 1,
          Math.abs(this.selection.startY - y) + 1,
        )
      }
    }
  }

  public onDrop(x: number, y: number, mod: ModKeys) {
    if (this.currentTool === 'select') {
      this.commitSelection()
    }
  }

  private startSelection(x: number, y: number) {
    this.selection = {
      startX: x,
      startY: y,
      x,
      y,
      w: 1,
      h: 1,
    }
  }

  private updateSelection(x: number, y: number, w: number, h: number) {
    if (this.selection) {
      this.selection.x = x
      this.selection.y = y
      this.selection.w = w
      this.selection.h = h
    }
  }

  private commitSelection() {}
}
