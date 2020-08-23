const tilesCtx = require.context(
  '../../../assets/HAS Overworld 2.0/',
  true,
  /LandTileset\.png$/,
)
const tileSets = tilesCtx.keys().reduce((acc, key) => {
  const [, name] = key.match(/\.\/(.+?)\/.*/)

  acc[name] = tilesCtx(key).default

  return acc
}, {} as Record<string, string>)

export default tileSets
