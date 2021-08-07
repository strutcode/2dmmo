import TilePosition from '../../../../../common/components/TilePosition'
import BaseObjective from '../../../BaseObjective'
import Mobile from '../../../components/Mobile'
import Speaker from '../../../components/Speaker'
import Listener from '../../../components/Listener'
import { distanceChebyshev } from '../../../util/Geometry'
import QuestLanguageParser from '../QuestLanguageParser'

type ProcessedLine = {
  test: () => boolean
  text: string
  throttle: number
  lastTime: number
  complete: boolean
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
      const whoValue = QuestLanguageParser.interpretValue(this.params.who.value)

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
          if (line.complete) {
            this.quest.advance()
          }
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
          } else if (variable.type === 'stage') {
            return `(${variable.value.x},${variable.value.y})`
          }
        }

        return '???'
      })
    }

    const getTrigger = (line: ProcessedLine) => {
      if (!rawLine.trigger) {
        return () => true
      }

      const parsed = QuestLanguageParser.interpretValue(rawLine.trigger)[0]

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
          if (parsed.args[0].type !== 'regex') {
            throw new Error('regex(): Argument 1 is not a regex')
          }

          // Create a native regex to test with
          const inst = new RegExp(
            parsed.args[0].value,
            parsed.args[0].modifiers,
          )

          return () => {
            let result = false

            this.speaker?.entity.with(Listener, (listener) => {
              listener.incoming.forEach((msg) => {
                // NPCs like listening to themselves talk
                if (msg.speaker === listener.entity.id) {
                  return
                }

                // Check if the message matches
                if (inst.test(msg.words)) {
                  result = true
                }
              })
            })

            return result
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
      complete: !!rawLine.complete,
    }

    line.test = getTrigger(line)

    return line
  }
}
