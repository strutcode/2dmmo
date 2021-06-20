import Component from '../../../common/engine/Component';

type SpriteData = {
  name: string
  data: string
}

export default class SpriteLoadQueue extends Component {
  public data: SpriteData[] = []

  public addData(name: string, data: string) {
    this.data.push({ name, data })
  }
}