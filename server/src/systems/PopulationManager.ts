import System from '../../../common/engine/System'
import Mobile from '../components/Mobile'
import TilePosition from '../../../common/components/TilePosition'
import Affectable from '../components/Affectable'
import Input from '../components/Input'
import Brain from '../components/Brain'
import RandomWalk from '../behaviors/RandomWalk'
import Player from '../components/Player'
import Speaker from '../components/Speaker'
import Listener from '../components/Listener'

export default class PopulationManager extends System {
  public update() {
    // TODO: need a better method
    const mobs = this.engine.getAllComponents(Mobile)
    const deer = mobs.filter((mob) => mob.name === 'Deerling')
    const npcs = mobs.filter((mob) => mob.sprite === 'monk')

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

    // Generate some NPCs
    if (npcs.length < 3) {
      this.engine.createEntity([
        [Mobile, { name: this.generateName(), sprite: 'monk' }],
        Input,
        Affectable,
        Speaker,
        Listener,
        [
          TilePosition,
          {
            x: Math.floor(Math.random() * 31) - 13,
            y: Math.floor(Math.random() * 31) - 13,
          },
        ],
      ])
    }

    // Update quests
    this.engine.forEachComponent(Player, (player) => {
      player.quests.forEach((quest) => {
        Object.values(quest.variables).forEach((variable) => {
          if (variable.value == null && variable.type === 'actor') {
            if (variable.filter?.match(/player/)) {
              variable.value = quest.owner.entity.getComponent(Mobile)
            } else {
              variable.value = npcs[Math.floor(Math.random() * npcs.length)]
            }
          }
        })
      })
    })
  }

  private namePieces = {
    start: ['fa', 'da', 'a', 'u', 'e', 'fo', 'ke', 'na', 'vi', 'fal', 'dal'],
    mid: ['be', 'na', 'ne', 'le', 'lo', 'ke', 'di', 'da', 'no', 'ri'],
    end: ['rt', 'nt', 'rr', 'n', 'o', 'd', 'm', 'mar'],
  }
  private generateName() {
    const arrayRand = (arr: any[]) =>
      arr[Math.floor(Math.random() * arr.length)]
    const upperCase = (input: string) =>
      input[0].toUpperCase() + input.substr(1)

    const start = () => upperCase(arrayRand(this.namePieces.start))
    const mid = () => arrayRand(this.namePieces.mid)
    const end = () => arrayRand(this.namePieces.end)
    const name = () => {
      if (Math.random() < 0.7) {
        return `${start()}${mid()}${end()}`
      } else {
        return `${start()}${mid()}${mid()}${end()}`
      }
    }

    return `${name()} ${name()}`
  }
}
