import { Cell } from './index'

let cache = {}

export default { getCells, getEdges, getCenter }

function parse(circle) {

  let [x, y, radius] = circle
  let start = [x, y]

  let cells = {}
  let edges = {}

  let edgeRadius = radius + 1
  let edgeMax = edgeRadius * edgeRadius

  let max  = radius * radius
  let size = edgeRadius * 2 + 1
  let area = size * size
  let i = area
  while (i--) {
    let [cx, cy] = Cell.fromIndex(i, size)
    let cell = [cx + x - edgeRadius, cy + y - edgeRadius]
    let dist = Cell.getDistance(cell, start, false)
    if (dist > max) {
      if (dist > edgeMax && !(cell in cells))
        continue
      edges[cell] = true
      continue
    }
    cells[cell] = true
  }

  cells = Object.keys(cells).map(Cell.fromString)
  edges = Object.keys(edges).map(Cell.fromString)

  return { cells, edges, center: start }

}

function getCached(circle) {
  let cached = cache[circle]
  if (!cached)
    cached = cache[circle] = parse(circle)
  return cached
}

function getCells(circle) {
  return getCached(circle).cells
}

function getEdges(circle) {
  return getCached(circle).edges
}

function getCenter(circle) {
  return getCached(circle).center
}
