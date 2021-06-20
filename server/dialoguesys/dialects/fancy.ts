export default {
  replace: [
    {
      test: /hey you/gi,
      replace: 'Dear sir',
    },
    {
      test: /i want to/gi,
      replace: 'I would',
    },
    {
      test: /tell me/gi,
      replace: 'Prithee',
    },
    {
      test: /do (\w+)/gi,
      replace: '$1 doest',
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
      replace: 'Good afternoon',
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
    {
      test: /you/gi,
      replace: 'thou',
    },
  ],
  mod: [],
  idiom: {
    exclamation: ['Gods have mercy'],
  },
}
