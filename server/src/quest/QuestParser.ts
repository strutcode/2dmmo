import QuestTemplate from './QuestTemplate'

type QuestSource = {
  version: string
  stages: {}[]
  actors: {}[]
  props: {}[]
  scenes: {
    objective: ObjectiveSource
  }[]
}

type ObjectiveSource = {
  type: string
  [param: string]: any
}

export default class QuestParser {
  public static parse(input: QuestSource): QuestTemplate {
    return new QuestTemplate()
  }

  public static interpretValue(input: string) {}

  protected static parseValue(input: string[]) {}

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
