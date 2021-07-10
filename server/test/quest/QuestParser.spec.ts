import QuestParser from '../../src/quest/QuestParser'

describe('Quest Parser', () => {
  it('can lexically analyze values', () => {
    expect(QuestParser['tokenizeValue']('test')).to.deep.equal(['test'])

    expect(QuestParser['tokenizeValue']('func()')).to.deep.equal([
      'func',
      '(',
      ')',
    ])

    expect(QuestParser['tokenizeValue']('func(foo, bar)')).to.deep.equal([
      'func',
      '(',
      'foo',
      ',',
      'bar',
      ')',
    ])

    expect(
      QuestParser['tokenizeValue']('proximity({foo}, {bar}, 20)'),
    ).to.deep.equal([
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
})
