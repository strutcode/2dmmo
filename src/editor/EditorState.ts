import GameMap, { TileData } from './GameMap'
import floodFill from './util/FloodFill'

export type ToolType = 'pencil' | 'fill' | 'select'
export type ModKeys = {
  ctrl: boolean
  alt: boolean
  shift: boolean
}

export interface Selection {
  drag: boolean
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
  public floatingSelection: (TileData | undefined)[][] | null = null

  public createMap() {
    this.currentMap = new GameMap()
  }

  public selectTile(set: string, x: number, y: number) {
    this.selectedTile = { x, y, set }
  }

  public onClick(x: number, y: number, mod: ModKeys) {
    if (this.currentMap) {
      if (this.currentTool === 'select') {
        if (this.selection && this.insideSelection(x, y)) {
          this.grabSelection(x, y)
        } else {
          this.startSelection(x, y)
        }
      } else if (this.selectedTile) {
        if (this.currentTool === 'pencil') {
          if (mod.ctrl) {
            this.selectedTile = this.currentMap.getTile(x, y) || null
          } else if (this.selectedTile) {
            this.currentMap.setTile(x, y, this.selectedTile)
          }
        } else if (this.currentTool === 'fill') {
          floodFill(
            x,
            y,
            this.selectedTile,
            (x, y) => {
              return this.currentMap?.getTile(x, y) || { x: 0, y: 0, set: '' }
            },
            this.currentMap.setTile.bind(this.currentMap),
            [0, 0, this.currentMap.width, this.currentMap.height],
            (a, b) => {
              if (!a || !b) return false
              if (a.x !== b.x) return false
              if (a.y !== b.y) return false
              if (a.set !== b.set) return false

              return true
            },
          )
        }
      }
    }
  }

  public onDrag(x: number, y: number, mod: ModKeys) {
    if (this.currentTool === 'pencil') {
      if (this.currentMap) {
        if (mod.ctrl) {
          this.selectedTile = this.currentMap.getTile(x, y) || null
        } else if (this.selectedTile) {
          this.currentMap.setTile(x, y, this.selectedTile)
        }
      }
    } else if (this.currentTool === 'select') {
      if (this.selection) {
        this.updateSelection(x, y)
      }
    }
  }

  public onDrop(x: number, y: number, mod: ModKeys) {
    if (this.currentTool === 'select') {
      this.commitSelection()
    }
  }

  private insideSelection(x: number, y: number) {
    if (!this.selection) return false
    if (x < this.selection.x) return false
    if (y < this.selection.y) return false
    if (x >= this.selection.x + this.selection.w) return false
    if (y >= this.selection.y + this.selection.h) return false

    return true
  }

  private startSelection(x: number, y: number) {
    if (this.selection && this.floatingSelection) {
      this.currentMap?.setTiles(
        this.selection.x,
        this.selection.y,
        this.floatingSelection,
      )
    }

    this.floatingSelection = null
    this.selection = {
      drag: false,
      startX: x,
      startY: y,
      x,
      y,
      w: 0,
      h: 0,
    }
  }

  private grabSelection(x: number, y: number) {
    if (this.selection) {
      this.selection.drag = true
      this.selection.startX = x
      this.selection.startY = y
    }
  }

  private updateSelection(x: number, y: number) {
    if (this.selection) {
      if (this.selection.drag) {
        this.selection.x += x - this.selection.startX
        this.selection.y += y - this.selection.startY
        this.selection.startX = x
        this.selection.startY = y
      } else {
        this.selection.x = Math.min(x, this.selection.startX)
        this.selection.y = Math.min(y, this.selection.startY)
        this.selection.w = Math.abs(this.selection.startX - x) + 1
        this.selection.h = Math.abs(this.selection.startY - y) + 1
      }
    }
  }

  private commitSelection() {
    if (this.selection && !this.selection.drag) {
      if (this.selection.w === 0 || this.selection.h === 0) {
        this.selection = null
      } else if (this.currentMap) {
        this.floatingSelection = this.currentMap.getTiles(
          this.selection.x,
          this.selection.y,
          this.selection.w,
          this.selection.h,
        )

        this.currentMap.clearTiles(
          this.selection.x,
          this.selection.y,
          this.selection.w,
          this.selection.h,
        )
      }
    }
  }
}
