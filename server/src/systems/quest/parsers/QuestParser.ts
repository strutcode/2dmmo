import QuestParserV1 from './QuestParserV1'
import QuestParserV2 from './QuestParserV2'
import QuestTemplate from '../QuestTemplate'

interface VersionedQuest {
  version: string
}

export default class QuestParser {
  public static parse(name: string, input: VersionedQuest): QuestTemplate {
    if (input.version === '1') {
      return QuestParserV1.parse(name, input as any)
    } else if (input.version === '2') {
      return QuestParserV2.parse(name, input as any)
    }

    throw new Error(`No valid parser for version '${input.version}'`)
  }
}
