const creaturesCtx = require.context(
  '../../../assets/HAS Creature Pack/',
  true,
  /\w+\(AllFrame\)\.png$/,
)
const enemies = creaturesCtx.keys().reduce((acc, key) => {
  const [, name] = key.match(/\.\/(.+?)\/\w+\(AllFrame\).png/)

  acc[name] = creaturesCtx(key).default

  return acc
}, {} as Record<string, string>)

export default enemies
