import Component from '../../../common/engine/Component'
import BaseBehavior from '../BaseBehavior'

export default class Brain extends Component {
  public behaviors: typeof BaseBehavior[] = []
  public activeBehaviors: BaseBehavior[] = []
}
