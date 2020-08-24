const spritesCtx = require.context('../../../data/sprites/', true, /\.json$/)

const sprites = spritesCtx.keys().reduce((acc, key) => {
  const name = key.replace('./', '').replace('.json', '')

  acc[name] = spritesCtx(key).default

  return acc
}, {} as Record<string, string>)

export default sprites
