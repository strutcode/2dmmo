import Component from '../../../common/engine/Component';
import { TileMapChunk } from '../util/MapLoader';

type ChunkMap = Record<string, boolean>

export default class TileVisibility extends Component {
  /** The number of tiles that are revealed in a given direction */
  public range = 8

  /** Tiles pending change */
  public pending: TileMapChunk[] = []

  /**
   * Whether or not a given chunk is visible
   */
  public revealed: ChunkMap = {}

  /** Adds a chunk to the reveal queue */
  public revealChunk(x: number, y: number, layers: number[][]) {
    const key = `${x},${y}`

    if (this.revealed[key]) return

    this.pending.push({ x, y, layers })
    this.revealed[key] = true
  }
  
  /** Adds a chunk to the hide queue */
  public hideChunk(x: number, y: number) {
    // this.pending.push({ x, y, layers: null })
    // this.revealed[`${x},${y}`] = false
  }
}