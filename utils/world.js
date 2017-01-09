import Random from './random'
import Vector from './vector'
import Pos    from './pos'
import Rect   from './rect'

const FLOOR = 0
const WALL  = 1
const DOOR  = 2
const DOOR_OPEN = 3

const sprites = {
  floor: {
    char: String.fromCharCode(183),
    color: 'olive'
  },
  wall: {
    char: '#',
    color: 'darkslategray'
  },
  door: {
    char: '+',
    color: 'sienna'
  },
  door_open: {
    char: '/',
    color: 'sienna'
  },
  hero: {
    char: '@',
    color: 'white'
  },
  wyrm: {
    char: 'w',
    color: 'lime'
  }
}

const tiles = [
  {
    name: 'floor',
    sprite: sprites.floor,
    walkable: true
  },
  {
    name: 'wall',
    sprite: sprites.wall,
    opaque: true
  },
  {
    name: 'door',
    sprite: sprites.door,
    opaque: true,
    door: true,
  },
  {
    name: 'door-open',
    sprite: sprites.door_open,
    walkable: true
  }
]

export default { FLOOR, WALL, DOOR, DOOR_OPEN, sprites, tiles, create }

function create (size) {

  var data  = new Uint8Array(size * size)

  var generate = function () {

    var generateRoom = createRoomgen( Math.round(size / 5), Math.round(size / 4) )

    function carveRooms() {
      world.rooms.length = 0
      var i = 12
      while (i--) {
        var room = carveRoom()
        if (room)
          world.rooms.push(room)
      }
    }

    function carveRoom() {
      var room, rooms = world.rooms
      var fails = 0
      do {
        room = generateRoom()
        var valid = true
        var i = rooms.length
        while (i--)
          if (Rect.isIntersecting(room, rooms[i], true)) {
            valid = false
            break
          }
        if (!valid)
          if (++fails >= 32) {
            room = null
            break
          }
      } while (!valid)
      if (room)
        fill(FLOOR, room)
      return room
    }

    function findStart() {
      do {
        var x = Random.get((size - 2) / 2) * 2 + 1
        var y = Random.get((size - 2) / 2) * 2 + 1
        var isWall = get(x, y) === WALL
      } while (!isWall)
      return Vector.create(x, y)
    }

    function carveHalls() {

      var connected = {}
      var roomEdges = {}
      var edgeRooms = {}
      world.rooms.some(function (room) {
        var edges = Rect.getEdges(room, true)
        roomEdges[room] = edges
        edges.some(function (edge) {
          var rooms = edgeRooms[edge]
          if (!rooms)
            rooms = edgeRooms[edge] = []
          rooms.push(room)
        })
      })

      var start = findStart()
      var ends  = [start]
      var stack = [start]
      var history = [start]

      while (stack.length) {
        var current = stack.pop()
        set(current, FLOOR)
        var valid = []
        var neighbors = Pos.getNeighbors(current, false, 2)
        var i = neighbors.length
        while (i--) {
          var neighbor = neighbors[i]
          var isWall   = get(neighbor) === WALL
          if (contains(neighbor) && isWall)
            valid.push(neighbor)
        }
        if (valid.length) {
          var neighbor = Random.choose(valid)
            stack.push(neighbor)
          history.push(neighbor)
          var distance = neighbor.clone().subtract(current)
          var step = distance.normalize()
          var dig = current.clone()
          for ( var i = 2; i--; set( dig.add(step), FLOOR ) );
        } else {
          var neighbors = Pos.getNeighbors(current)
          if (step)
            var doors = 0
          neighbors.some(function (neighbor) {
            var id = neighbor.x + ',' + neighbor.y
            var rooms = edgeRooms[id]
            if (rooms) {
              rooms.some(function (room) {
                if (step || !connected[room])
                  set(neighbor, DOOR), doors++
                connected[room] = true
              })
            }
          })
          if (step)
            if (!doors)
              ends.push(current)
          step = null
          current = history.pop()
          if (current)
            stack.push(current)
        }
      }
      return ends
    }

    function fillEnds(ends) {
      while (ends.length) {
        var current = ends.pop()
        var neighbors = Pos.getNeighbors(current)
        var valid = []
        neighbors.some(function (neighbor) {
          var tile = get(neighbor)
          if (tile === FLOOR || tile == DOOR)
            valid.push(neighbor)
        })
        if (valid.length === 1) {
          set(current, WALL)
          ends.unshift(valid[0])
        }
      }
    }

    return function generate() {
      fill()
      carveRooms()
      var ends = carveHalls()
      fillEnds(ends)
      return world
    }

  }()

  var world = { data, tiles, rooms: [], entities: [], size, get, set, fill, generate, posToIndex, indexToPos, contains }
  return world

  function get(x, y) {
    var a = arguments.length
    if (a === 1) {
      if ( !isNaN(x) )
        var index = x
      if (x)
        var pos = Pos.normalize(x), index = posToIndex(pos)
      else
        return x
    } else if (a === 2)
      var pos = Pos.normalize(x, y), index = posToIndex(pos)
    if ( contains(index) )
      return data[index]
    return null
  }

  function set(x, y, value) {
    var a = arguments.length
    if (a === 2)
      var pos = Pos.normalize(x), value = y
    if (a === 3)
      var pos = Pos.normalize(x, y)
    var index = posToIndex(pos)
    if ( contains(index) )
      return ( data[index] = value )
    return null
  }

  function fill(tile, rect) {
    tile = !arguments.length ? WALL : tile
    if (rect) {
      var [ rectX, rectY, rectWidth, rectHeight ] = rect
      var i = rectWidth * rectHeight
      while (i--) {
        var { x, y } = Pos.fromIndex(i, rectWidth)
        var index = posToIndex( [ rectX + x, rectY + y ] )
        data[index] = tile
      }
    } else {
      world.rooms.length = 0
      world.entities.length = 0
      for (var i = data.length; i--; data[i] = tile);
    }
    return world
  }

  function posToIndex(x, y) {
    var pos = Pos.normalize(x, y)
    return Pos.toIndex(pos, size)
  }

  function indexToPos(index) {
    return Pos.fromIndex(index, size)
  }

  // contains(x, y)|(position)|(index) -> Boolean
  // > Determines if the given position is within the world boundaries.
  function contains(x, y) {
    var a = arguments.length
    if (a === 1) {
      if ( !isNaN(x) )
        return x >= 0 && x < data.length
      if (x)
        var { x, y } = Pos.normalize(x)
      else
        return x
    }
    return x >= 0 && x < size && y >= 0 && y < size
  }

  function createRoomgen(min, max) {
    function getRoomSize() {
      return Random.get((max - min) / 2 + 1) * 2 + min
    }
    function getRoomPos(roomSize) {
      return Random.get((size - roomSize) / 2) * 2 + 1
    }
    return function generateRoom() {
      var w = getRoomSize()
      var h = getRoomSize()
      var x = getRoomPos(w)
      var y = getRoomPos(h)
      return [x, y, w, h]
    }
  }

}
