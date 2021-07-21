import QuestParser from '../../src/quest/QuestParser'

describe('Quest Parser', () => {
  describe('can lexically analyze values', () => {
    const tokenize = QuestParser['tokenizeValue']

    it('handles basic lexical values', () => {
      expect(tokenize('test')).to.deep.equal(['test'])

      expect(tokenize('func()')).to.deep.equal(['func', '(', ')'])

      expect(tokenize('func(foo, bar)')).to.deep.equal([
        'func',
        '(',
        'foo',
        ',',
        'bar',
        ')',
      ])

      expect(tokenize('add(2, 2)')).to.deep.equal([
        'add',
        '(',
        '2',
        ',',
        '2',
        ')',
      ])

      expect(tokenize('proximity({foo}, {bar}, 20)')).to.deep.equal([
        'proximity',
        '(',
        '{',
        'foo',
        '}',
        ',',
        '{',
        'bar',
        '}',
        ',',
        '20',
        ')',
      ])
    })

    it('can escape characters', () => {
      expect(tokenize('foo\\ bar')).to.deep.equal(['foo bar'])
    })

    it('can lex strings', () => {
      expect(tokenize('"foo bar"')).to.deep.equal(['"', 'foo bar', '"'])
      expect(tokenize('"\\"foo\\" bar"')).to.deep.equal(['"', '"foo" bar', '"'])
    })

    it('can lex regex', () => {
      expect(tokenize('/foo/')).to.deep.equal(['/', 'foo', '/'])
      expect(tokenize('/foo bar/')).to.deep.equal(['/', 'foo bar', '/'])
      expect(tokenize('/abc\\/def/')).to.deep.equal(['/', 'abc/def', '/'])
      expect(tokenize('/foo/abc')).to.deep.equal(['/', 'foo', '/', 'abc'])
    })
  })

  it('can parse lexed values', () => {
    const parse = QuestParser['parseValue']

    expect(parse('{|bar|}'.split('|'))).to.deep.equal([
      {
        type: 'var',
        name: 'bar',
      },
    ])

    expect(parse('add|(|2|,|2|)'.split('|'))).to.deep.equal([
      {
        type: 'call',
        name: 'add',
        args: [
          { type: 'number', value: 2 },
          { type: 'number', value: 2 },
        ],
      },
    ])

    expect(parse('func|(|{|foo|}|,|{|bar|}|)'.split('|'))).to.deep.equal([
      {
        type: 'call',
        name: 'func',
        args: [
          { type: 'var', name: 'foo' },
          { type: 'var', name: 'bar' },
        ],
      },
    ])

    expect(parse('/|reg.*ex|/|ig'.split('|'))).to.deep.equal([
      {
        type: 'regex',
        value: 'reg.*ex',
        modifiers: 'ig',
      },
    ])
  })

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
    const template = QuestParser.parse('test', quest)

    expect(template.variables).to.have.length(5)
    expect(template.scenes).to.have.length(1)
  })
})
