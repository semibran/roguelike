import { Cell } from './index'

let cache = {}

export default { getCells, getEdges, getCenter }

function cellsFromObject(obj) {
  return Object.keys(obj).map( key => key.split(',').map(Number) )
}

function cacheDiamond(diamond) {

  let [x, y, radius] = diamond

  let start = [x, y]
  let stack = [start]
  let cells = { [start]: 0 }
  let edges = {}
  let doors = {}

  while (stack.length) {
    let node = stack.pop()
    let nexts = Cell.getNeighbors(node).filter( neighbor => !(neighbor.toString() in cells) )
    for (let next of nexts) {
      let steps = cells[node] + 1
      if (steps <= radius) {
        cells[next] = steps
        stack.unshift(next)
      } else
        edges[next] = steps
    }
  }

  cells = cellsFromObject(cells)
  edges = cellsFromObject(edges)

  return { cells, edges, center: start }

}

function getCached(diamond) {
  let cached = cache[diamond]
  if (!cached)
    cached = cache[diamond] = cacheDiamond(diamond)
  return cached
}

function getCells(diamond) {
  return getCached(diamond).cells
}

function getEdges(diamond) {
  return getCached(diamond).edges
}

function getCenter(diamond) {
  return getCached(diamond).center
}
