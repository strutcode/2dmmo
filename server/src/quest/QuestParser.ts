import BaseBehavior from '../BaseBehavior'
import BaseObjective from '../BaseObjective'
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

export default class QuestParser {
  public static parse(name: string, input: QuestSource): QuestTemplate {
    const template = new QuestTemplate(name)

    if (input.version !== '1') throw new Error('Invalid version field')

    if (input.stages) {
      for (let key in input.stages) {
        template.variables.push({ type: 'stage', name: key, filter: null })
      }
    }

    if (input.actors) {
      for (let key in input.actors) {
        template.variables.push({ type: 'actor', name: key, filter: null })
      }
    }

    if (input.props) {
      for (let key in input.props) {
        template.variables.push({ type: 'prop', name: key, filter: null })
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

  public static interpretValue(input: string) {}

  protected static parseValue(tokens: string[]) {
    let i = 0

    const maybeFuncCall = () => {
      if (tokens[i + 1] !== '(') return false

      const value = {
        type: 'call',
        name: tokens[i],
        args: [] as any[],
      }

      // Skip name and opening paren
      i += 2

      while (tokens[i] !== ')' && i < tokens.length) {
        let element

        if (tokens[i] === ',') {
          i++
        } else if ((element = maybeFuncCall())) {
          value.args.push(element)
        } else if ((element = maybeVariable())) {
          value.args.push(element)
        } else {
          parseError()
        }
      }

      // closing paren
      i++

      return value
    }
    const maybeVariable = () => {
      if (tokens[i] !== '{') return false
      if (tokens[i + 2] !== '}') parseError()

      const value = {
        type: 'var',
        name: tokens[i + 1],
      }

      // Parsed so move ahead
      i += 3

      return value
    }
    const parseError = () => {
      throw new Error(`Parsing error: ${tokens[i]}`)
    }

    const body = []

    for (; i < tokens.length; i++) {
      let element

      if ((element = maybeFuncCall())) {
        body.push(element)
      } else if ((element = maybeVariable())) {
        body.push(element)
      } else {
        parseError()
      }
    }

    return body
  }

  protected static tokenizeValue(input: string) {
    const tokens: string[] = []

    let activeToken = ''
    const pushToken = (token: string) => tokens.push(token)
    const endToken = () => {
      if (activeToken.length > 0) {
        pushToken(activeToken)
      }

      activeToken = ''
    }

    for (let i = 0; i < input.length; i++) {
      const c = input[i]

      if (c.match(/\s/)) {
        endToken()
      } else if (c.match(/[\(\)\{\},]/)) {
        endToken()
        pushToken(c)
      } else if (c.match(/[a-z0-9]/)) {
        activeToken += c
      } else {
        console.log(`Invalid token: '${c}' at offset ${i}`)
      }
    }

    endToken()

    return tokens
  }
}