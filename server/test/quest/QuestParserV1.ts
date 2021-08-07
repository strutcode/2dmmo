import QuestParserV1 from '../../src/systems/quest/parsers/QuestParserV1'

describe('Quest Parser v1', () => {
  it('can build a quest template from source', () => {
    const quest = {
      version: '1',
      stages: {
        smithy: 'blacksmith, dwarf',
        destination:
          'distance > 300, distance < 900, difficulty medium to hard',
      },
      actors: {
        bob: 'npc, dwarf, smith, age > 40',
        soandso: 'pc',
      },
      props: {
        bauble: 'sword or dagger or amulet, value > 700',
      },
      scenes: [
        {
          objective: {
            type: 'Dialogue',
            who: '{bob}',
            lines: [
              {
                trigger: 'proximity({bob}, {soandso}, 20)',
                say: 'You there, {soandso}. Can you [help] me?',
              },
              {
                trigger: 'regex(help)',
                say: 'I lost my {bauble}, can you help me [get it back]?',
              },
              {
                trigger: 'regex(get.*back)',
                say: 'Thank you! I think I lost it near {destination}.',
                complete: true,
              },
            ],
          },
        },
      ],
    }
    const template = QuestParserV1.parse('test', quest)

    expect(template.variables).to.have.length(5)
    expect(template.scenes).to.have.length(1)
  })
})
