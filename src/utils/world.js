import { Cell, Rect } from './index'

const [FLOOR, WALL, DOOR, DOOR_OPEN, STAIRS] = [0, 1, 2, 3, 4]
const tiles = [
  {
    name: 'floor',
    walkable: true
  },
  {
    name: 'wall',
    opaque: true
  },
  {
    name: 'door',
    opaque: true,
    door: true
  },
  {
    name: 'door_open',
    walkable: true,
    door: true
  },
  {
    name: 'stairs',
    walkable: true,
    stairs: true
  }
]

let costs = [0, Infinity, 2, 1, 0]

const constants = { FLOOR, WALL, DOOR, DOOR_OPEN, STAIRS, tiles, costs }
const methods   = { create, fill, clear, getAt, setAt, getSize, findPath, openDoor, closeDoor, toggleDoor }
const World     = Object.assign({}, constants, methods)

export default World

let sqrt = function (cache) {

  cache = cache || {}

  return function sqrt(num) {
    let cached = cache[num]
    if (cached)
      return cached
    let result = cache[num] = Math.sqrt(num)
    return result
  }

}()

function create(size) {
  return new Uint8ClampedArray(size * size)
}

function fill(data, id, rect) {
  if (typeof id === 'undefined')
    id = WALL
  let size = getSize(data)
  if (rect) {
    let cells = Rect.getCells(rect)
    for (let cell of cells)
      setAt(data, cell, id)
  } else {
    let i = data.length
    while (i--)
      data[i] = id
  }
  return data
}

function clear(data) {
  fill(data, FLOOR)
  return data
}

function getAt(data, cell) {
  let size = getSize(data)
  if ( !Cell.isInside(cell, size) )
    return null
  let index = Cell.toIndex(cell, size)
  return data[index]
}

function setAt(data, cell, value) {
  let size = getSize(data)
  if ( !Cell.isInside(cell, size) )
    return null
  let index = Cell.toIndex(cell, size)
  data[index] = value
  return value
}

function getSize(data) {
  return sqrt(data.length)
}

function findPath(data, start, goal, costs) {
  costs = costs || World.costs

  let path = []

  let size = getSize(data)

  let startId = start.toString()
  let goalId  = goal.toString()

  let opened = [startId]
  let closed = {}

  let scores = { f: {}, g: {} }
  let parent = {}

  let cells = data.reduce( (cells, id, index) => cells.concat( [ Cell.fromIndex(index, size) ] ), [] )
  for (let cell of cells) {
    scores.g[cell] = Infinity
    scores.f[cell] = Infinity
  }

  scores.g[start] = 0
  scores.f[start] = Cell.getManhattan(start, goal)

  while (opened.length) {
    if (opened.length > 1)
      opened = opened.sort( (a, b) => scores.f[b] - scores.f[a] )
    let cellId = opened.pop()
    let cell = Cell.fromString(cellId)
    if (cellId === goalId) {
      let cell = goal
      do {
        path.unshift(cell)
        cell = parent[cell]
      } while (cell)
      return path
    }
    closed[cell] = true
    for ( let neighbor of Cell.getNeighbors(cell) ) {
      if (!Cell.isInside(neighbor, size) || neighbor in closed)
        continue
      let cost = costs[ getAt(data, neighbor) ] || 0
      if (cost === Infinity)
        continue
      let g = scores.g[cell] + 1 + cost
      let id = neighbor.toString()
      if ( !opened.includes(id) )
        opened.push(id)
      else if ( g >= scores.g[neighbor] )
        continue
      parent[neighbor] = cell
      scores.g[neighbor] = g
      scores.f[neighbor] = g + Cell.getManhattan(neighbor, goal)
    }
  }

  return null

}

function openDoor(data, cell) {
  data = data.slice()
  let id = World.getAt(data, cell)
  if (id === DOOR || id === DOOR_OPEN)
    World.setAt(data, cell, DOOR_OPEN)
  return data
}

function closeDoor(data, cell) {
  data = data.slice()
  let id = World.getAt(data, cell)
  if (id === DOOR || id === DOOR_OPEN)
    World.setAt(data, cell, DOOR)
  return data
}

function toggleDoor(data, cell) {
  data = data.slice()
  let id = World.getAt(data, cell)
  if (id === DOOR)
    World.setAt(data, cell, DOOR_OPEN)
  if (id === DOOR_OPEN)
    World.setAt(data, cell, DOOR)
  return data
}
