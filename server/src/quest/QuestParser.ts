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

type AstReference = {
  type: 'var'
  name: string
}

type AstString = {
  type: 'string'
  value: string
}

type AstRegex = {
  type: 'regex'
  value: string
  modifiers: string
}

type AstNumber = {
  type: 'number'
  value: number
}

type AstBareword = {
  type: 'word'
  value: string
}

type AstFuncCall = {
  type: 'call'
  name: string
  args: AstEntry[]
}

type AstEntry =
  | AstReference
  | AstFuncCall
  | AstString
  | AstRegex
  | AstNumber
  | AstBareword

type AstBody = AstEntry[]

export default class QuestParser {
  public static parse(name: string, input: QuestSource): QuestTemplate {
    const template = new QuestTemplate(name)

    if (input.version !== '1') throw new Error('Invalid version field')

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

  public static interpretValue(input: string) {
    return this.parseValue(this.tokenizeValue(input))
  }

  protected static parseValue(tokens: string[]) {
    let i = 0

    const maybeFuncCall = (): AstFuncCall | null => {
      if (tokens[i + 1] !== '(') return null

      const value = {
        type: 'call',
        name: tokens[i],
        args: [] as AstEntry[],
      } as const

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
        } else if ((element = maybeString())) {
          value.args.push(element)
        } else if ((element = maybeRegex())) {
          value.args.push(element)
        } else if ((element = maybeNumber())) {
          value.args.push(element)
        } else if ((element = maybeBareword())) {
          value.args.push(element)
        } else {
          parseError()
        }
      }

      // closing paren
      i++

      return value
    }

    const maybeVariable = (): AstReference | null => {
      if (tokens[i] !== '{') return null
      if (tokens[i + 2] !== '}') parseError()

      const value = {
        type: 'var',
        name: tokens[i + 1],
      } as const

      // Parsed so move ahead
      i += 3

      return value
    }

    const maybeString = (): AstString | null => {
      if (tokens[i] !== '"') return null
      if (tokens[i + 2] !== '"') parseError()

      const value = {
        type: 'string',
        value: tokens[i + 1],
      } as const

      // Parsed so move ahead
      i += 3

      return value
    }

    const maybeRegex = (): AstRegex | null => {
      if (tokens[i] !== '/') return null
      if (tokens[i + 2] !== '/') parseError()

      const value = {
        type: 'regex' as const,
        value: tokens[i + 1],
        modifiers: 'i',
      }

      // Parsed so move ahead
      i += 3

      // If valid modifiers were found...
      if (tokens[i].match(/[igm]+/)) {
        // Set them and move ahead again
        value.modifiers = tokens[i]
        i++
      }

      return value
    }

    const maybeNumber = (): AstNumber | null => {
      if (!tokens[i].match(/[\d\.]+/)) return null

      const value = {
        type: 'number',
        value: Number(tokens[i]),
      } as const

      // Parsed so move ahead
      i++

      return value
    }

    const maybeBareword = (): AstBareword | null => {
      const value = {
        type: 'word',
        value: tokens[i],
      } as const

      // Parsed so move ahead
      i++

      return value
    }

    const parseError = () => {
      throw new Error(`Parsing error: ${i} -> ${tokens}`)
    }

    const body: AstBody = []

    for (; i < tokens.length; i++) {
      let element

      if ((element = maybeVariable())) {
        body.push(element)
      } else if ((element = maybeFuncCall())) {
        body.push(element)
      } else if ((element = maybeString())) {
        body.push(element)
      } else if ((element = maybeRegex())) {
        body.push(element)
      } else if ((element = maybeNumber())) {
        body.push(element)
      } else if ((element = maybeBareword())) {
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
    let endChars = '\r\n\t '

    const pushToken = (token: string) => tokens.push(token)
    const endToken = () => {
      if (activeToken.length > 0) {
        pushToken(activeToken)
      }

      activeToken = ''
    }

    for (let i = 0; i < input.length; i++) {
      const c = input[i]

      if (c === '\\') {
        // Skip the escape char

        // Add The next char raw
        activeToken += input[i + 1]

        // Skip the next char for parsing
        i++
      } else if (c === '"' || endChars === '"') {
        const inString = endChars === '"'

        if (!inString) {
          // Opening quote, close the previous token
          endToken()

          // Push the quote itself
          pushToken(c)

          // Set the ending token
          endChars = c
        } else if (c === '"') {
          // End quote, finish token
          endToken()

          // Push the quote itself
          pushToken(c)

          // Reset end chars
          endChars = '\r\n\t '
        } else {
          // Ignore contents
          activeToken += c
        }
      } else if (c === '/' || endChars === '/') {
        const inRegex = endChars === '/'

        if (!inRegex) {
          // Opening slash, close the previous token
          endToken()

          // Push the slash itself
          pushToken(c)

          // Set the ending token
          endChars = c
        } else if (c === '/') {
          // End slash, finish token
          endToken()

          // Push the slash itself
          pushToken(c)

          // Reset end chars
          endChars = '\r\n\t '

          // Gather modifiers
          i++
          while (i < input.length && !endChars.includes(input[i])) {
            activeToken += input[i]
            i++
          }

          endToken()
        } else {
          // Ignore contents
          activeToken += c
        }
      } else if (endChars.includes(c)) {
        endToken()
      } else if (c.match(/[\(\)\{\},]/)) {
        endToken()
        pushToken(c)
      } else if (c.match(/[a-z0-9]/)) {
        activeToken += c
      } else {
        console.log(`Invalid token: '${c}' at offset ${i}`)
        break
      }
    }

    endToken()

    return tokens
  }
}
