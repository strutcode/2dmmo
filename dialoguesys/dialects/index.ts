type Dialect = {
  replace: {
    test: RegExp
    replace: Parameters<String['replace']>[1]
  }[]
  mod: {}[]
  idiom: {
    exclamation?: string | string[]
  }
}

const dialectCtx = require.context('./', false)
const dialects = dialectCtx.keys().reduce((acc, key) => {
  const name = key.replace('./', '').replace('.ts', '')

  if (name !== 'index') {
    acc[name] = dialectCtx(key).default
  }

  return acc
}, {} as Record<string, Dialect>)

function arrRand<T extends Array<any>>(input: T): T[number] {
  return input[Math.floor(Math.random() * input.length)]
}

export default function dialect(input: string, dialect: string) {
  const d = dialects[dialect]

  if (d) {
    let result = input

    d.replace.forEach((rep) => {
      result = result.replace(rep.test, rep.replace)
    })

    result = result.replace('[exclamation]', () => {
      if (d.idiom.exclamation) {
        if (Array.isArray(d.idiom.exclamation)) {
          return arrRand(d.idiom.exclamation)
        }

        return d.idiom.exclamation
      }

      return 'Damnit'
    })

    return result
  }

  return input
}
