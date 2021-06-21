import Component from '../../../common/engine/Component'

/** A component which tracks an integer tile-wise position */
export default class TilePosition extends Component {
  /** Whether this component has been updated */
  public dirty = false

  public map = 'default'

  // TODO: Massive hack because I can't monitor component updates... yet
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
}
