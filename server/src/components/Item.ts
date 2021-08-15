import Component from '../../../common/engine/Component'

type LocationDescriptor = {
  type: 'world' | 'mobile'
  target: number | { x: number; y: number }
}

export default class Item extends Component {
  public name: string = 'Doodad'
  public sprite: string = 'doodad'
  public desiredLocation?: LocationDescriptor
}
