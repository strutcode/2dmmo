const spritesCtx = require.context('../../../data/sprites/', true, /\.json$/)

const sprites = spritesCtx.keys().reduce((acc, key) => {
  const name = key.replace('./', '').replace('.json', '')

  acc[name] = spritesCtx(key)

  return acc
}, {} as Record<string, { set: string }>)

export default sprites
