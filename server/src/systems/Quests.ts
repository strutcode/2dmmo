import { readFileSync } from 'fs'
import { glob } from 'glob'
import { basename } from 'path'
import System from '../../../common/engine/System'
import BaseObjective from '../BaseObjective'
import Mobile from '../components/Mobile'
import Player from '../components/Player'

type QuestTemplate = {
  name: string
}

export default class Quests extends System {
  private objectives: BaseObjective[] = []
  private quests: QuestTemplate[] = []

  public start() {
    this.loadObjectives()
    this.loadQuests()
  }

  public update() {
    // TODO: Load quests
    // TODO: Tie in to population and resource systems somehow
    // TODO: Query quests to assign to players

    // Update all players and give them new quests if necessary
    this.engine.forEachComponent(Player, (player) => {
      if (player.sideQuests.length < 1) {
        this.generateSideQuest(player)
      }
    })
  }

  private generateMainQuest(player: Player) {}

  private generateSideQuest(player: Player) {
    player.entity.with(Mobile, (mob) => {
      console.log(`Generating a side quest for '${mob.name}'`)
    })

    const quest = this.quests.find(() => true)

    if (quest) {
      // TODO: Fill in all quest variables from the world or by spawning

      // Actually assign the quest
      player.sideQuests.push({
        name: quest.name,
        variables: {},
      })

      console.log(`Added quest '${quest.name}'`)
    } else {
      console.log(`Couldn't find a suitable quest`)
    }
  }

  private loadObjectives() {
    // Load effects
    this.objectives = glob
      .sync('../objectives/*.js', { cwd: __dirname })
      .map((filename) => require(filename).default)

    console.log(`Read ${this.objectives.length} quest objectives from disk`)
  }

  private loadQuests() {
    const files = glob.sync('data/quests/*.json')

    // Iterate each quest file and parse it
    files.forEach((filename) => {
      const content = readFileSync(filename, { encoding: 'utf8' })
      const parsed = JSON.parse(content) as ActionCard[]

      // TODO: Verify and pre-process data, e.g. analyzing query strings

      this.quests.push({
        name: basename(filename).replace('.json', ''),
        ...parsed,
      })
    })

    console.log(`Read ${files.length} quests from disk`)
  }
}
