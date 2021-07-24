interface Point {
  x: number
  y: number
}

export function distanceManhattan(a: Point, b: Point) {
  return Math.abs(a.x - b.x) + Math.abs(a.y - b.y)
}

export function distanceChebyshev(a: Point, b: Point) {
  return Math.max(Math.abs(a.x - b.x), Math.abs(a.y - b.y))
}

export function distanceEuclidean(a: Point, b: Point) {
  return Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2))
}
