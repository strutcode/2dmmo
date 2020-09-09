export default {
  replace: [
    {
      test: /hey you/gi,
      replace: 'Young one',
    },
    {
      test: /i want to/gi,
      replace: 'I wish to',
    },
    {
      test: /tell me/gi,
      replace: 'Pray tell',
    },
    {
      test: /talk to/gi,
      replace: 'speak with',
    },
    {
      test: /talk/gi,
      replace: 'speak',
    },
    {
      test: /hello/gi,
      replace: 'Fair tidings',
    },
    {
      test: /haven't/gi,
      replace: 'have not',
    },
    {
      test: /don't (\w+)/gi,
      replace: '$1 not',
    },
    {
      test: /don't/gi,
      replace: 'do not',
    },
    {
      test: /you've/gi,
      replace: 'you have',
    },
  ],
  mod: [],
  idiom: {
    exclamation: ['Tunare save us'],
  },
}
