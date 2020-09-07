export default {
  replace: [
    {
      test: /don't|do not/gi,
      replace: 'dinnae',
    },
    {
      test: /want to/gi,
      replace: 'wanna',
    },
    {
      test: /hey you/gi,
      replace: 'Oi laddie',
    },
    {
      test: /hello/gi,
      replace: 'Ey laddie',
    },
    {
      test: /Come here/gi,
      replace: "C'mere",
    },
    {
      test: /welcome/gi,
      replace: "Y'come",
    },
    {
      test: /you/gi,
      replace: 'ye',
    },
    {
      test: /to/gi,
      replace: 'ta',
    },
    {
      test: /my/gi,
      replace: 'ma',
    },
  ],
  mod: [],
  idiom: {
    exclamation: ["By Thor's blue balls", 'Tug ma beard and call me Sally'],
  },
}
