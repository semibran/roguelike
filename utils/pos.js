import Vector from './vector'

const LEFT       = [-1, 0]
const RIGHT      = [ 1, 0]
const UP         = [ 0,-1]
const DOWN       = [ 0, 1]
const UP_LEFT    = [-1,-1]
const UP_RIGHT   = [ 1,-1]
const DOWN_LEFT  = [-1, 1]
const DOWN_RIGHT = [ 1, 1]
const DIRECTIONS = [UP_LEFT, UP, UP_RIGHT, LEFT, RIGHT, DOWN_LEFT, DOWN, DOWN_RIGHT]
const DIRECTIONS_ADJACENT = [LEFT, RIGHT, UP, DOWN]

const constants = { LEFT, RIGHT, UP, DOWN, UP_LEFT, UP_RIGHT, DOWN_LEFT, DOWN_RIGHT, DIRECTIONS, DIRECTIONS_ADJACENT }
const methods   = { getNeighbors, fromIndex, toIndex, normalize }

export default Object.assign(constants, methods)

var steps = {}
function getNeighbors(pos, diagonals, scale) {
  scale = scale || 1
  var dirs = diagonals ? DIRECTIONS : DIRECTIONS_ADJACENT
  var neighbors = []
  var i = dirs.length
  while (i--) {
    var dir = dirs[i]
    var cached = steps[dir]
    if (!cached)
      cached = steps[dir] = {}
    var step = cached[scale] = cached[scale] || Vector.create(dir).scale(scale)
    var neighbor = Vector.create(pos).add(step)
    neighbors.push(neighbor)
  }
  return neighbors
}

function toIndex(pos, width) {
  if ( Array.isArray(pos) )
    var [ x, y ] = pos
  else
    var { x, y } = pos
  return y * width + x
}

function fromIndex(index, width) {
  var x = index % width
  var y = ( index - x ) / width
  return { x, y }
}

function normalize(x, y) {
  if ( typeof y === 'undefined' )
    if ( Array.isArray(x) )
      y = x[1], x = x[0]
    else if (x)
      y = x.y, x = x.x
  return { x, y }
}
