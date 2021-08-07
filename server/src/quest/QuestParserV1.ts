import QuestTemplate from './QuestTemplate'

type QuestSource = {
  version: string
  stages?: Record<string, string>
  actors?: Record<string, string>
  props?: Record<string, string>
  scenes: {
    objective: ObjectiveSource
  }[]
}

type ObjectiveSource = {
  type: string
  result?: ActionSource[]
  [param: string]: any
}

type ActionSource = {
  type: string
}

export default class QuestParserV1 {
  public static parse(name: string, input: QuestSource): QuestTemplate {
    const template = new QuestTemplate(input.version, name)

    if (input.version !== '1') throw new Error('Parser version mismatch')

    if (input.stages) {
      for (let key in input.stages) {
        template.variables.push({
          type: 'stage',
          name: key,
          filter: input.stages[key],
        })
      }
    }

    if (input.actors) {
      for (let key in input.actors) {
        template.variables.push({
          type: 'actor',
          name: key,
          filter: input.actors[key],
        })
      }
    }

    if (input.props) {
      for (let key in input.props) {
        template.variables.push({
          type: 'prop',
          name: key,
          filter: input.props[key],
        })
      }
    }

    input.scenes.forEach((scene) => {
      const params: Partial<ObjectiveSource> = { ...scene.objective }

      delete params.type
      delete params.result

      template.scenes.push({
        objective: {
          type: scene.objective.type,
          params,
          actions: (scene.objective.result ?? []).map((src) => {
            const params: Partial<ActionSource> = { ...src }

            delete params.type

            return {
              type: src.type,
              params,
            }
          }),
        },
      })
    })

    return template
  }
}
