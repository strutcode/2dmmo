export default function floodFill<T>(
  x: number,
  y: number,
  value: T,
  getGrid: (x: number, y: number) => T | undefined,
  setGrid: (x: number, y: number, v: T) => void,
  bounds: [number, number, number, number],
  compare: (a: T | undefined, b: T | undefined) => boolean = (a, b) => a === b,
) {
  if (compare(getGrid(x, y), value)) {
    return
  }

  const initial = getGrid(x, y)
  const frontier = new Set<string>()
  const visited = new Set<string>()
  const key = (x: number, y: number) => `${x},${y}`
  const queue = (x: number, y: number) => {
    const item = key(x, y)

    if (x < bounds[0]) return
    if (x >= bounds[2]) return
    if (y < bounds[1]) return
    if (y >= bounds[3]) return
    if (visited.has(item)) return

    frontier.add(item)
  }

  queue(x + 1, y)
  queue(x - 1, y)
  queue(x, y + 1)
  queue(x, y - 1)

  let i = 0
  while (frontier.size > 0 && i < 1000) {
    const item = frontier.keys().next().value as string
    const [x, y] = item.split(',').map(Number) as number[]

    if (getGrid(x, y) == null) {
      visited.add(key(x, y))
      frontier.delete(item)
      continue
    }

    if (compare(getGrid(x, y), initial)) {
      setGrid(x, y, value)

      queue(x + 1, y)
      queue(x - 1, y)
      queue(x, y + 1)
      queue(x, y - 1)
    }

    visited.add(key(x, y))
    frontier.delete(item)
    i++
  }
}
