import Component from '../../../common/engine/Component';

type SpriteData = {
  name: string
  data: string
}

/** A queue of images to load from the server */
export default class SpriteLoadQueue extends Component {
  /** Image data returned from the server */
  public data: SpriteData[] = []

  /** Store data returned from the server */
  public addData(name: string, data: string) {
    this.data.push({ name, data })
  }
}