import { readFileSync } from 'fs'
import { glob } from 'glob'
import { basename } from 'path'
import System from '../../../common/engine/System'
import BaseObjective from '../BaseObjective'
import Mobile from '../components/Mobile'
import Player from '../components/Player'
import QuestInstance from './quest/QuestInstance'
import QuestParser from './quest/parsers/QuestParser'
import QuestTemplate from './quest/QuestTemplate'
import NodeInterpreter from './quest/NodeInterpreter'
import Node from './quest/Node'

export default class Quests extends System {
  private objectives: typeof BaseObjective[] = []
  private nodes: typeof Node[] = []
  private quests: QuestTemplate[] = []

  public start() {
    this.loadObjectives()
    this.loadNodes()
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
        if (!quest?.ready) {
          for (let name in quest.variables) {
            if (quest.variables[name].value == null) {
              // If any variable is not filled the quest is still not ready
              return
            }
          }

          // All variables are filled, mark the quest ready
          quest.ready = true
          quest.start()
        }

        quest.update()
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

    const template = this.quests.find((quest) => quest.name === 'test2')

    if (template) {
      // Create the quest instance
      const quest = this.createQuestInstance(template, player)

      // Other systems will fill in the variables
      player.sideQuests.push(quest)

      console.log(`Added quest '${quest.name}'`)
    } else {
      console.log(`Couldn't find a suitable quest`)
    }
  }

  /** Creates an instance of a quest. Other systems will prepare it to actually run. */
  private createQuestInstance(template: QuestTemplate, player: Player) {
    // Create the quest instance
    const quest = new QuestInstance(template, player)

    // Construct the objectives, if any
    template.scenes.forEach((scene) => {
      if (!scene.objective) return

      const Prototype = this.objectives.find(
        (obj) => obj.name === scene.objective?.type,
      )

      if (!Prototype) {
        throw new Error(
          `Tried to load objective '${scene.objective.type}' for '${template.name}' but couldn't find one`,
        )
      }

      const objective = new Prototype(this.engine, quest)

      const params = scene.objective.params
      for (let name in params) {
        if (objective.params[name]) {
          objective.params[name].value = params[name]
        } else {
          console.warn(
            `Tried to set non-existent param '${name}' on objective '${objective.constructor.name}'`,
          )
        }
      }

      quest.objectives.push(objective)
    })

    // Construct nodes, if any
    template.scenes.forEach((scene) => {
      if (!scene.nodes) return

      const nodeTree = new NodeInterpreter()

      scene.nodes.forEach((nodeSrc) => {
        const Prototype = this.nodes.find((obj) => obj.name === nodeSrc.type)

        if (!Prototype) {
          throw new Error(
            `Tried to load node '${nodeSrc.type}' for '${template.name}' but couldn't find one`,
          )
        }

        const node = new Prototype(nodeSrc.data)

        nodeTree.addNode(node)
      })

      quest.nodeTrees.push(nodeTree)
    })

    return quest
  }

  private loadObjectives() {
    // Load effects
    this.objectives = glob
      .sync('./quest/objectives/*.js', { cwd: __dirname })
      .map((filename) => require(filename).default)

    console.log(`Read ${this.objectives.length} quest objectives from disk`)
  }

  private loadNodes() {
    // Load effects
    this.nodes = glob
      .sync('./quest/nodes/*.js', { cwd: __dirname })
      .map((filename) => require(filename).default)

    console.log(`Read ${this.nodes.length} quest nodes from disk`)
  }

  private loadQuests() {
    const files = glob.sync('data/quests/*.json')

    // Iterate each quest file and parse it
    files.forEach((filename) => {
      const content = readFileSync(filename, { encoding: 'utf8' })

      if (!content) {
        return
      }

      try {
        const parsed = JSON.parse(content)

        const name = basename(filename).replace('.json', '')

        this.quests.push(QuestParser.parse(name, parsed))
      } catch (e) {
        console.warn('Failed to load quest')
        console.warn(e.message)
      }
    })

    console.log(`Read ${files.length} quests from disk`)
  }
}
