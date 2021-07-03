import Entity from '../../../common/engine/Entity'
import System from '../../../common/engine/System'
import Mobile from '../components/Mobile'
import TilePosition from '../../../common/components/TilePosition'
import { performance } from 'perf_hooks'
import Affectable from '../components/Affectable'
import Input from '../components/Input'
import Brain from '../components/Brain'
import RandomWalk from '../behaviors/RandomWalk'

type Deer = {
  entity: Entity
  moveTimer: number
}

export default class PopulationManager extends System {
  public update() {
    // TODO: need a better method
    const deer = this.engine
      .getAllComponents(Mobile)
      .filter((mob) => mob.name === 'Deerling')

    // If there are fewer than 10 deer
    if (deer.length < 10) {
      // Spawn a new one
      this.engine.createEntity([
        [Mobile, { name: 'Deerling', sprite: 'deer' }],
        Input,
        Affectable,
        [
          TilePosition,
          {
            x: Math.floor(Math.random() * 31) - 13,
            y: Math.floor(Math.random() * 31) - 13,
          },
        ],
        [Brain, { behaviors: [RandomWalk] }],
      ])
    }
  }
}
