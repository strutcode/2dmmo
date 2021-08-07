import QuestTemplate from './QuestTemplate';

type QuestSource = {
  version: string
  resources: Record<string, QuestVariable>
  scenes: QuestScene[]
}

type QuestVariable = {
  requirements: Record<string, unknown>
}

type QuestScene = {
  script: NodeSource[]
}

type NodeSource = {
  type: string
  inputs?: {
    [name: string]: {}
  }
  outputs?: {
    [name: string]: {}
  }
  connections?: {
    flow?: number
    input?: {
      [name: string]: number[]
    }
    output?: {
      [name: string]: number[]
    }
  }
}

export default class QuestParserV2 {
  public static parse(name: string, input: QuestSource) {
    const template = new QuestTemplate(input.version, name)

    return template
  }
}