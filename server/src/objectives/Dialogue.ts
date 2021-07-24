import TilePosition from '../../../common/components/TilePosition'
import BaseObjective from '../BaseObjective'
import Mobile from '../components/Mobile'
import Speaker from '../components/Speaker'
import QuestParser from '../quest/QuestParser'
import { distanceChebyshev } from '../util/Geometry'
import { performance } from 'perf_hooks'

type ProcessedLine = {
  test: () => boolean
  text: string
  throttle: number
  lastTime: number
}

export default class Dialogue extends BaseObjective {
  public params = {
    who: {
      kind: 'mobile',
      required: true,
      value: null as any,
    },
    lines: {
      kind: 'dialogue',
      required: true,
      value: null as any,
    },
  }

  private speaker?: Speaker
  private processedLines = [] as ProcessedLine[]

  public setup() {
    if (this.params.who.value) {
      const whoValue = QuestParser.interpretValue(this.params.who.value)

      if (whoValue[0].type !== 'var') {
        throw new Error('Invalid who value')
      }

      const speakerMob = this.quest.variables[whoValue[0].name].value

      this.speaker = speakerMob.entity.getComponent(Speaker)
    }

    if (this.params.lines.value) {
      this.params.lines.value.forEach((line: any) => {
        this.processedLines.push(this.processLine(line))
      })
    }
  }

  public update() {
    if (this.speaker) {
      for (let line of this.processedLines) {
        if (line.test()) {
          this.speaker?.say(line.text)
        }
      }
    }
  }

  private processLine(rawLine: any): ProcessedLine {
    const interpolateText = () => {
      return rawLine.say.replace(/\{(\w+)\}/gi, (_: any, name: string) => {
        const variable = this.quest.variables[name]

        if (variable) {
          if (variable.type === 'actor') {
            return variable.value.name
          } else if (variable.type === 'prop') {
            return variable.value.name
          }
        }

        return '???'
      })
    }

    const getTrigger = (line: ProcessedLine) => {
      if (!rawLine.trigger) {
        return () => true
      }

      const parsed = QuestParser.interpretValue(rawLine.trigger)[0]

      if (parsed.type !== 'call') {
        throw new Error(`Not a valid trigger value`)
      }

      switch (parsed.name) {
        case 'proximity':
          if (parsed.args[0].type !== 'var') {
            throw new Error('proximity(): Argument 1 is not a var')
          }
          if (parsed.args[1].type !== 'var') {
            throw new Error('proximity(): Argument 2 is not a var')
          }
          if (parsed.args[2].type !== 'number') {
            throw new Error('proximity(): Argument 3 is not a number')
          }

          const lhs = this.quest.variables[parsed.args[0].name].value as Mobile
          const rhs = this.quest.variables[parsed.args[1].name].value as Mobile
          const distance = parsed.args[2].value / 10 // 10 feet per tile

          return () => {
            let result = false
            const now = new Date().valueOf()

            if (now - line.lastTime > line.throttle) {
              lhs.entity.with(TilePosition, (posA) => {
                rhs.entity.with(TilePosition, (posB) => {
                  result = distanceChebyshev(posA, posB) <= distance
                })
              })
            }

            if (result) {
              line.lastTime = now
            }

            return result
          }
        case 'regex':
          return () => {
            return false
          }
        default:
          throw new Error('Invalid function name in trigger')
      }
    }

    const line: ProcessedLine = {
      test: () => true,
      text: interpolateText(),
      throttle: 10 * 60 * 1000,
      lastTime: 0,
    }

    line.test = getTrigger(line)

    return line
  }
}
