import { readFileSync } from 'fs'
import { glob } from 'glob'
import { basename } from 'path'
import System from '../../../common/engine/System'
import BaseObjective from '../BaseObjective'
import Mobile from '../components/Mobile'
import Player from '../components/Player'
import QuestInstance from '../quest/QuestInstance'
import QuestParser from '../quest/QuestParser'
import QuestTemplate from '../quest/QuestTemplate'

export default class Quests extends System {
  private objectives: BaseObjective[] = []
  private quests: QuestTemplate[] = []

  public start() {
    this.loadObjectives()
    this.loadQuests()
  }

  public update() {
    // Update all players
    this.engine.forEachComponent(Player, (player) => {
      // Assign new quests if necessary
      if (player.sideQuests.length < 1) {
        this.generateSideQuest(player)
      }

      // Update existing quests
      player.quests.forEach((quest) => {
        if (!quest?.ready) return

        quest.currentObjective?.update(quest)
      })
    })
  }

  private generateMainQuest(player: Player) {
    player.entity.with(Mobile, (mob) => {
      console.log(
        `Generating a main quest for '${mob.name}'... Shit's about to get real`,
      )
    })
  }

  private generateSideQuest(player: Player) {
    player.entity.with(Mobile, (mob) => {
      console.log(`Generating a side quest for '${mob.name}'`)
    })

    const template = this.quests.find(() => true)

    if (template) {
      const quest = new QuestInstance(template)
      // Just create the quest. Other systems will fill in the variables
      player.sideQuests.push(quest)

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
      const parsed = JSON.parse(content)

      const name = basename(filename).replace('.json', '')

      this.quests.push(QuestParser.parse(name, parsed))
    })

    console.log(`Read ${files.length} quests from disk`)
  }
}
