import Component from '../../../common/engine/Component'

export default class TilePosition extends Component {
  private _x = 0
  private _y = 0

  public get x() {
    return this._x
  }
  public set x(v) {
    this._x = v
    this.dirty = true
  }

  public get y() {
    return this._y
  }
  public set y(v) {
    this._y = v
    this.dirty = true
  }

  public dirty = false
}
