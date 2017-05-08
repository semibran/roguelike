import { Cell } from './index'

const tileData = [
  'floor walkable',
  'wall opaque',
  'door opaque door',
  'doorOpen walkable door',
  'doorSecret opaque door secret',
  'entrance walkable stairs',
  'exit walkable stairs'
]

const tiles = function (tileData) {
  let tiles = []
  let i = tileData.length
  while (i--) {
    let tile = tiles[i] = { type: 'tile', id: i }
    let [kind, ...props] = tileData[i].split(' ')
    tile.kind = kind
    for (let prop of props)
      tile[prop] = true
  }
  return tiles
}(tileData)

const tileNames = Object.keys(tiles)

const tileIds = function (tiles) {
  let tileIds = {}
  let i = 0
  for (let tile of tiles) {
    let id = tile.kind.split('').reduce((result, char, index) => {
      let CHAR = char.toUpperCase()
      if (char === CHAR || !index)
        result[result.length] = ''
      result[result.length - 1] += CHAR
      return result
    }, []).join('_')
    tileIds[id] = i
    i++
  }
  return tileIds
}(tiles)

const tileCosts = function (tiles) {
  let tileCosts = []
  for (let tile of tiles) {
    let cost = 0
    if (!tile.walkable && !tile.door)
      cost = Infinity
    if (tile.secret)
      cost = 1000
    if (tile.door) {
      cost++
      if (!tile.walkable)
        cost++
    }
    tileCosts.push(cost)
  }
  return tileCosts
}(tiles)

const { FLOOR, WALL, DOOR, DOOR_OPEN, DOOR_SECRET, ENTRANCE, EXIT } = tileIds

export default {
  tiles, tileNames, tileIds, tileCosts,
  create
}

function create(size) {

  let area = size * size
  let data = new Uint8ClampedArray(area)

  let world = {
    size, data, elements: new Set, entrance: null, exit: null,
    getAt, tileAt, elementsAt, setAt, fill, clear, spawn, kill, findPath, findStep
  }

  return world

  function getAt(cell) {
    if (!Cell.isInside(cell, size))
      return null
    let index = Cell.toIndex(cell, size)
    return data[index]
  }

  function tileAt(cell) {
    return tiles[getAt(cell)]
  }

  function elementsAt(cell) {
    return [...world.elements].filter(element => Cell.isEqual(cell, element.cell))
  }

  function setAt(cell, value) {
    if (!Cell.isInside(cell, size))
      return null
    let index = Cell.toIndex(cell, size)
    data[index] = value
    return value
  }

  function fill(rect, value) {

    if (!Array.isArray(rect))
      rect = [0, 0, size, size]

    if (isNaN(value))
      value = WALL

    let [rectX, rectY, rectWidth, rectHeight] = rect

    let area = rectWidth * rectHeight

    let i = area
    while (i--) {
      let [x, y] = Cell.fromIndex(i, rectWidth)
      let index  = Cell.toIndex([x + rectX, y + rectY], size)
      data[index] = value
    }

    return world

  }

  function clear(rect) {
    return world
  }

  function spawn(element, cell) {
    element.world = world
    element.cell  = cell
    world.elements.add(element)
  }

  function kill(element) {
    return world.elements.delete(element)
  }

  function findPath(start, goal, costs, diagonals) {

    if (!costs)
      costs = {}

    if (!costs.tiles)
      costs.tiles = tileCosts

    if (!costs.cells)
      costs.cells = {}

    let path = []

    let startKey = start.toString()
    let goalKey  = goal.toString()

    let opened = [startKey]
    let closed = {}

    let scores = { f: {}, g: {} }
    let parent = {}

    let cells = data.map((id, index) => Cell.fromIndex(index, size))
    for (let cell of cells) {
      scores.g[cell] = Infinity
      scores.f[cell] = Infinity
    }

    scores.g[start] = 0
    scores.f[start] = Cell.getManhattan(start, goal)

    while (opened.length) {
      if (opened.length > 1)
        opened = opened.sort( (a, b) => scores.f[b] - scores.f[a] )
      let cellKey = opened.pop()
      let cell = Cell.fromString(cellKey)
      if (cellKey === goalKey) {
        let cell = goal
        do {
          path.unshift(cell)
          cell = parent[cell]
        } while (cell)
        return path
      }
      closed[cell] = true
      for ( let neighbor of Cell.getNeighbors(cell, diagonals) ) {
        if (!Cell.isInside(neighbor, size) || neighbor in closed)
          continue
        let key = neighbor.toString()
        let tileCost = costs.tiles[getAt(neighbor)] || 0
        let cellCost = costs.cells[neighbor] || 0
        let cost = tileCost + cellCost
        if (cost === Infinity && key !== goalKey)
          continue
        let g = scores.g[cell] + 1 + cost
        if ( !opened.includes(key) )
          opened.push(key)
        else if ( g >= scores.g[neighbor] )
          continue
        parent[neighbor] = cell
        scores.g[neighbor] = g
        scores.f[neighbor] = g + Cell.getManhattan(neighbor, goal)
      }
    }

    return null

  }

  function findStep(path, cell) {
    if (!path)
      return null
    let next, index = 0
    do {
      next = path[index++]
    } while (next && !Cell.isEqual(cell, next))
    next = path[index]
    if (!next)
      return null
    let [cx, cy] = cell
    let [nx, ny] = next
    let step = [nx - cx, ny - cy]
    return step
  }

}
