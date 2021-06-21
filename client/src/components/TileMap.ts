import Component from '../../../common/engine/Component';

type Chunk = {
  x: number
  y: number
  layers: number[][]
}

/** Handles tile map data */
export default class TileMap extends Component {
  /** Tile chunks waiting to be parsed */
  public toLoad: Chunk[] = []
}