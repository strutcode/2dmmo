import BaseObjective from '../../BaseObjective'
import Player from '../../components/Player'
import NodeInterpreter from './NodeInterpreter'
import QuestTemplate from './QuestTemplate'

type VariableInstance = {
  type: 'stage' | 'actor' | 'prop'
  filter: any
  value: any
}

export default class QuestInstance {
  public ready = false
  public variables: Record<string, VariableInstance> = {}
  public objectives: BaseObjective[] = []
  public nodeTrees: NodeInterpreter[] = []
  private sceneIndex = 0

  public constructor(public template: QuestTemplate, public owner: Player) {
    template.variables.forEach((variable) => {
      this.variables[variable.name] = {
        type: variable.type,
        filter: variable.filter,
        value: null,
      }
    })
  }

  public get version() {
    return this.template.version
  }

  public get name() {
    return this.template.name
  }

  public get currentObjective(): BaseObjective | undefined {
    return this.objectives[this.sceneIndex]
  }

  public get currentNodeTree(): NodeInterpreter | undefined {
    return this.nodeTrees[this.sceneIndex]
  }

  public start() {
    if (this.version === '1') {
      this.currentObjective?.setup()
    } else if (this.version === '2') {
      this.currentNodeTree?.start(this)
    }
  }

  public update() {
    if (this.version === '1') {
      this.currentObjective?.update()
    } else if (this.version === '2') {
      this.currentNodeTree?.update(this)
    }
  }

  public advance() {
    this.sceneIndex++

    if (this.version === '1') {
      this.currentObjective?.setup()
    } else if (this.version === '2') {
      this.currentNodeTree?.start(this)
    }
  }
}
