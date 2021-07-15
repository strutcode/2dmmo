import BaseObjective from '../BaseObjective'
import Mobile from '../components/Mobile'
import Speaker from '../components/Speaker'
import QuestParser from '../quest/QuestParser'

export default class Dialogue extends BaseObjective {
  public params = {
    who: {
      kind: 'mobile',
      required: true,
      value: null,
    },
    lines: {
      kind: 'dialogue',
      required: true,
      value: null,
    },
  }

  public setup() {
    if (this.params.who.value) {
      const whoValue = QuestParser.interpretValue(this.params.who.value)
      const speaker = this.quest.variables[whoValue[0].name]

      if (speaker.value instanceof Mobile) {
        speaker.value.entity.with(Speaker, (speaker) => {
          speaker.say(this.processLine(this.params.lines.value[0].say))
        })
      }
    }
  }

  public update() {}

  private processLine(line: string) {
    return line.replace(/\{(\w+)\}/gi, (_, name) => {
      const variable = this.quest.variables[name]

      if (variable) {
        if (variable.type === 'actor') {
          return variable.value.name
        }
      }

      return '???'
    })
  }
}
