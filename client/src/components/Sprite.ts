import Component from '../../../common/engine/Component'

/** A visual representation of an entity */
export default class Sprite extends Component {
  /** Global X position */
  public x = 0
  /** Global Y position */
  public y = 0

  /** Rotation in degrees */
  public r = 0

  /** Global width before scaling */
  public width = 16
  /** Global height before scaling */
  public height = 16

  /** Optional image tint in hex format, e.g. 0xff0000 */
  public tint = 0xffffff

  /** The asset name */
  public name = 'default'

  /** Current animation frame */
  public currentFrame = 0

  /** Animation speed */
  public fps = 10
}
