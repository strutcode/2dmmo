import Component from '../engine/Component'

/** A component which tracks an integer tile-wise position */
export default class TilePosition extends Component {
  public map = 'default'

  public x = 0
  public y = 0
}
