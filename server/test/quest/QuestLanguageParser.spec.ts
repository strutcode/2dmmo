import QuestLanguageParser from '../../src/systems/quest/parsers/QuestLanguageParser'

describe('Quest Parser', () => {
  describe('can lexically analyze values', () => {
    const tokenize = QuestLanguageParser['tokenizeValue']

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
    const parse = QuestLanguageParser['parseValue']

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
})
