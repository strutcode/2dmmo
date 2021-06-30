import Component from '../../../common/engine/Component'
import BaseEffect from '../BaseEffect'

export default class Affectable extends Component {
  public added: BaseEffect[] = []
  public active: BaseEffect[] = []
  public removed: BaseEffect[] = []

  public addEffect(effect: BaseEffect) {
    this.added.push(effect)
  }
}
