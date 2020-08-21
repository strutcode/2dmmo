import GameMap, { TileData } from './GameMap'
import floodFill from './util/FloodFill'
import Observable from '../common/Observable'
import EnemyData from './EnemyData'

export type ToolType = 'pencil' | 'eraser' | 'fill' | 'select'
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

export type EditorMode = 'world' | 'enemies' | 'items' | 'users'
export type DataRequestCategory =
  | 'maps'
  | 'map'
  | 'saveMap'
  | 'enemies'
  | 'enemy'
  | 'renameEnemy'
  | 'saveEnemy'
  | 'users'

export default class EditorState {
  public onRequestData = new Observable<(type: string, params: any) => void>()

  public mode: EditorMode = 'world'
  public connected = false

  public maps: string[] = []
  public enemies: string[] = []
  public items: string[] = []
  public users = []

  public currentMap: GameMap | null = null
  public selectedTile: TileData | null = null
  public activeLayer: number = 0
  public currentTool: ToolType = 'pencil'
  public selection: Selection | null = null
  public floatingSelection: (TileData | undefined)[][] | null = null

  public currentEnemy: EnemyData | null = null

  public destroy() {}

  public requestData(type: DataRequestCategory, params: any = null) {
    this.onRequestData.notify(type, params)
  }

  public receiveData(type: DataRequestCategory, data: any) {
    if (type === 'maps') {
      this.maps = data
    } else if (type === 'map') {
      if (!this.currentMap) {
        this.currentMap = new GameMap()
      }

      this.currentMap.deserialize(data)
    } else if (type === 'enemies') {
      this.enemies = data
    } else if (type === 'enemy') {
      if (!this.currentEnemy) {
        this.currentEnemy = new EnemyData(data.key)
      }

      this.currentEnemy.deserialize(data)
    } else if (type === 'users') {
      this.users = data
    }
  }

  public createMap() {
    this.currentMap = new GameMap()
  }

  public async loadMap(name: string) {
    this.requestData('map', name)
  }

  public async saveMap() {
    if (this.currentMap) {
      this.requestData('saveMap', this.currentMap.serialize())
    }
  }

  public async loadEnemy(name: string) {
    this.requestData('enemy', name)
  }

  public createEnemy() {
    let name = 'New Enemy'

    this.currentEnemy = new EnemyData(name)

    if (!this.enemies.includes('New Enemy')) {
      this.enemies.push(name)
    }
  }

  public renameEnemy() {
    if (this.currentEnemy) {
      const oldVal = this.currentEnemy.key
      const newVal = prompt('Enter a new name', oldVal)

      if (newVal) {
        this.currentEnemy.key = newVal
        this.enemies = this.enemies.map(name =>
          name === oldVal ? newVal : name,
        )
        this.requestData('renameEnemy', {
          from: oldVal,
          to: this.currentEnemy.key,
        })
      }
    }
  }

  public async saveEnemy() {
    if (this.currentEnemy) {
      this.requestData('saveEnemy', this.currentEnemy.serialize())
    }
  }

  public selectTile(set: string, x: number, y: number) {
    this.selectedTile = { x, y, set }
  }

  public selectLayer(index: number) {
    this.currentMap?.selectLayer(index)
    this.activeLayer = index
  }

  public layerAdd() {
    this.currentMap?.addLayer()
  }

  public layerRename() {
    if (this.currentMap?.layers[this.activeLayer]) {
      const value = prompt(
        'Enter a new name',
        this.currentMap?.layers[this.activeLayer].name,
      )

      if (value) {
        this.currentMap.layers[this.activeLayer].name = value
      }
    }
  }

  public layerUp() {
    if (this.activeLayer > 0) {
      const layer = this.currentMap?.layers.splice(this.activeLayer, 1)

      if (layer) {
        this.currentMap?.layers.splice(this.activeLayer - 1, 0, layer[0])
        this.activeLayer--
      }
    }
  }

  public layerDown() {
    const length = this.currentMap?.layers?.length || 0

    if (this.activeLayer < length - 1) {
      const layer = this.currentMap?.layers.splice(this.activeLayer, 1)

      if (layer) {
        this.currentMap?.layers.splice(this.activeLayer + 1, 0, layer[0])
        this.activeLayer++
      }
    }
  }

  public layerDelete() {
    this.currentMap?.layers.splice(this.activeLayer, 1)
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
        } else if (this.currentTool === 'eraser') {
          this.currentMap.setTile(x, y, undefined)
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
    if (this.currentTool === 'select') {
      if (this.selection) {
        this.updateSelection(x, y)
      }
    } else if (this.currentMap) {
      if (this.currentTool === 'pencil') {
        if (mod.ctrl) {
          this.selectedTile = this.currentMap.getTile(x, y) || null
        } else if (this.selectedTile) {
          this.currentMap.setTile(x, y, this.selectedTile)
        }
      } else if (this.currentTool === 'eraser') {
        this.currentMap.setTile(x, y, undefined)
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
