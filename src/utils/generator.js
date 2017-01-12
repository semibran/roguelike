import { Random, World, Cell, Rect } from './index'

const { FLOOR, WALL, DOOR, DOOR_OPEN, DOOR_HIDDEN, STAIRS } = World

export default { createDungeon }

function findRoom(min, max, worldSize) {
  var w = Random.get((max - min) / 2 + 1) * 2 + min
  var h = Random.get((max - min) / 2 + 1) * 2 + min
  var x = Random.get((worldSize - w) / 2) * 2 + 1
  var y = Random.get((worldSize - h) / 2) * 2 + 1
  return [x, y, w, h]
}

let Diamond = function () {

  let cache = {}

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
        } else {
          let [nextX, nextY] = next
          let [distX, distY] = [nextX - x, nextY - y]
          if (!distX || !distY)
            doors[next] = steps
          edges[next] = steps
        }
      }
    }

    cells = cellsFromObject(cells)
    edges = cellsFromObject(edges)
    doors = cellsFromObject(doors)

    return { cells, edges, doors }

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

  return { getCells, getEdges }

}()

function findDiamondRoom(min, max, worldSize) {
  let radius = Random.get((max - min) / 2 + 1) * 2 + min
  let nodes = findNodes(worldSize, radius).map(Cell.fromString)
  let diamond = Random.choose(nodes)
  diamond.push(radius)
  return diamond
}

function findRooms(data, maxRatio) {
  maxRatio = maxRatio || 0.33
  let size = World.getSize(data)
  let area = size * size
  let min = Math.round(size / 5)
  let max = Math.round(size / 4)
  let valid
  let rooms = { cells: {}, edges: {}, rects: {}, diamonds: {}, list: [] }
  let total = 0
  let fails = 0
  let failed = {}
  do {
    let type = 'rect'
    let shape
    do {
      valid = true
      let cells
      if (Random.choose(100))
        type = 'diamond'
      if (type === 'rect') {
        shape = findRoom(min, max, size)
        cells = Rect.getBorder(shape)
      } else if (type === 'diamond') {
        shape = findDiamondRoom(2, 4, size)
        cells = Diamond.getEdges(shape)
      }
      if (failed[shape]) {
        valid = false
        continue
      }
      for (let cell of cells) {
        if (rooms.cells[cell] || rooms.edges[cell]) {
          failed[shape] = true
          valid = false
          break
        }
      }
    } while (!valid && ++fails < area)
    if (valid) {
      let room, edges
      room = { edges: {}, shape, type }
      if (type === 'rect') {
        edges = Rect.getEdges(shape, true)
        rooms.rects[shape] = room
        room.cells = Rect.getCells(shape)
      } else if (type === 'diamond') {
        edges = Diamond.getEdges(shape)
        rooms.diamonds[shape] = room
        room.cells = Diamond.getCells(shape)
      }
      for (let cell of room.cells)
        rooms.cells[cell] = room
      for (let edge of edges) {
        let sharedEdges = room.edges[edge] = rooms.edges[edge] = rooms.edges[edge] || []
        sharedEdges.push(room)
      }
      rooms.list.push(room)
      total += room.cells.length
    }
  } while (valid && total / area < maxRatio)
  return rooms
}

function findNodes(worldSize, offset) {
  offset = offset || 0
  let data = null
  if (typeof worldSize === 'object') {
    data = worldSize
    worldSize = World.getSize(data)
  }
  let nodes = []
  let half = (worldSize - 1) / 2 - offset
  let i = half * half
  while (i--) {
    let [nodeX, nodeY] = Cell.fromIndex(i, half)
    let node = [nodeX * 2 + 1 + offset, nodeY * 2 + 1 + offset]
    if (!data || World.getAt(data, node) === WALL && !Cell.getNeighbors(node, true).filter(neighbor => World.getAt(data, neighbor) !== WALL).length)
      nodes.push( node.toString() )
  }
  return nodes
}

function findMazes(data) {
  let size = World.getSize(data)
  let mazes = { cells: {}, ends: {}, list: [] }
  let nodes = new Set( findNodes(data).map(Cell.toString) )
  while (nodes.size) {
    let maze = { cells: {}, ends: {}, type: 'maze' }
    let start = Random.choose( [...nodes] )
    let id    = Cell.fromString(start)
    let stack = [id]
    let track = [id]
    let end   = true
    mazes.ends[start] = maze.ends[start] = maze
    while (stack.length) {
      let node, [nodeX, nodeY] = node = stack.pop()
      nodes.delete( node.toString() )
      mazes.cells[node] = maze.cells[node] = maze
      let neighbors = Cell.getNeighbors(node, false, 2).filter(function (neighbor) {
        if (World.getAt(data, neighbor) !== WALL || neighbor in mazes.cells)
          return false
        let nonwalls = Cell.getNeighbors(neighbor, true).filter(neighbor => World.getAt(data, neighbor) !== WALL)
        return !nonwalls.length
      })
      if (neighbors.length) {
        let neighbor = Random.choose(neighbors)
        let [neighborX, neighborY] = neighbor
        let [distX, distY] = [neighborX - nodeX, neighborY - nodeY]
        let [stepX, stepY] = [ distX / (Math.abs(distX) || 1), distY / (Math.abs(distY) || 1) ]
        let midpoint = [nodeX + stepX, nodeY + stepY]
        mazes.cells[midpoint] = maze.cells[midpoint] = maze
        stack.push(neighbor)
        track.push(neighbor)
        end = false
      } else {
        if (!end) {
          mazes.ends[node] = maze.ends[node] = maze
          end = true
        }
        if (track.length)
          stack.push( track.pop() )
      }
    }
    mazes.list.push(maze)
  }
  return mazes
}

function findConnectors(data, rooms, mazes) {
  let connectors = {}
  for (let id in rooms.edges) {
    let cell = Cell.fromString(id)
    let neighbors = Cell.getNeighbors(cell)
    let regions = []
    for (let neighbor of neighbors) {
      let [x, y] = neighbor
      if (x % 2 && y % 2 && World.getAt(data, neighbor) === FLOOR) {
        let region = rooms.cells[neighbor] || mazes.cells[neighbor]
        if (region)
          regions.push(region)
      }
    }
    if (regions.length === 2)
      connectors[cell] = regions
  }
  return connectors
}

function findDoors(data, rooms, mazes) {

  let connectorRegions = findConnectors(data, rooms, mazes)
  let start = Random.choose(rooms.list)
  let stack = [start]
  let track = [start]
  let doors = []
  let hidden = []

  let disconnected = new Set(rooms.list)
  let connected = new Set( [start] )

  while (stack.length) {
    let node = stack.pop()
    if ( rooms.list.includes(node) && disconnected.has(node) )
      disconnected.delete(node)
    let connectors = getConnectors(node)
    let connectorKeys = Object.keys(connectors)
    if (connectorKeys.length) {
      let connector = Random.choose(connectorKeys)
      let next = connectors[connector]
      if (next) {
        // Remove extraneous connectors
        for (let id in next.cells) {
          let cell = Cell.fromString(id)
          let neighbors = Cell.getNeighbors(cell)
          for (let neighbor of neighbors) {
            if ( neighbor in connectorRegions && connectorRegions[neighbor].includes(node) )
              delete connectorRegions[neighbor]
          }
        }
        doors.push(connector)
        stack.push(next)
        track.push(next)
        connected.add(next)
      }
    } else {
      if (track.length)
        stack.push( track.pop() )
    }
  }

  for (let room of disconnected) {
    let edges = Object.keys(room.edges).filter( (edge) => edge in connectorRegions )
    if (edges.length) {
      let edge = Random.choose(edges)
      hidden.push(edge)
    }
  }

  if (hidden.length)
    console.log(`Something doesn't feel right about this dungeon...`)

  return { normal: doors, hidden, list: doors.concat(hidden) }

  // Connectors store the `regions` they connect; get the one that's not `node`
  function getNext(regions, node) {
    for (let region of regions)
      if (region !== node)
        return region
    return null
  }

  // Get the valid connectors of the specified `node`
  function getConnectors(node) {
    let connectors = {}
    let prospects = []
    // Normalize based on type
    if (node.type === 'rect' || node.type === 'diamond') {
      for (let id in node.edges)
        if (id in connectorRegions)
          prospects.push(id)
    } else if (node.type === 'maze') {
      for (let id in node.ends) {
        let cell = Cell.fromString(id)
        let neighbors = Cell.getNeighbors(cell).map(Cell.toString)
        for (let neighbor of neighbors)
          if (neighbor in connectorRegions)
            prospects.push(neighbor)
      }
    }
    for (let id of prospects) {
      let regions = connectorRegions[id]
      let next = getNext(regions, node)
      if (next) {
        let chance = Random.choose(50)
        if ( chance || !connected.has(next) )
          connectors[id] = next
      }
    }
    return connectors
  }

}

function fillEnds(data, ends) {
  let stack = Object.keys(ends).map(Cell.fromString)
  while (stack.length) {
    let cell = stack.pop()
    let neighbors = Cell.getNeighbors(cell)
    let escapes = []
    for (let neighbor of neighbors) {
      let id = World.getAt(data, neighbor)
      let tile = World.tiles[id]
      if (tile.walkable || tile.door)
        escapes.push(neighbor)
    }
    if (escapes.length === 1) {
      World.setAt(data, cell, WALL)
      stack.push( escapes[0] )
    }
  }
}

function generate(size) {

  let data = World.fill( World.create(size) )

  // let room = findDiamondRoom(2, 4, size)
  //
  // for (let id in room.cells)
  //   World.setAt(data, Cell.fromString(id), FLOOR)
  //
  // for (let id in room.edges)
  //   World.setAt(data, Cell.fromString(id), DOOR)

  let rooms = findRooms(data)
  for (let room of rooms.list) {
    for (let cell of room.cells)
      World.setAt(data, cell, FLOOR)
  }

  let mazes = findMazes(data)
  for (let maze of mazes.list)
    for (let id in maze.cells)
      World.setAt(data, Cell.fromString(id), FLOOR)

  let doors = findDoors(data, rooms, mazes)

  for (let id of doors.normal) {
    let type = DOOR
    if (Random.choose(10))
      type = DOOR_OPEN
    World.setAt(data, Cell.fromString(id), type)
  }

  for (let id of doors.hidden)
    World.setAt(data, Cell.fromString(id), DOOR_HIDDEN)

  fillEnds(data, mazes.ends)

  return {data, rooms}

}

function createDungeon(size) {

  if (!size % 2)
    throw new RangeError(`Cannot create dungeon of even size ${size}`)

  let {data, rooms} = generate(size)
  let entities = []

  function spawn(item, cell) {
    if (!world.rooms)
      return null
    if (!cell) {
      let valid
      do {
        let room = Random.choose(world.rooms.list)
        cell = Random.choose(room.cells)
      } while (entitiesAt(cell).length)
    }
    if ( !isNaN(item) )
      setAt(cell, item)
    else if (typeof item === 'object') {
      item.world = world
      item.cell  = cell
      item.look()
      entities.push(item)
    }
    return cell
  }

  function entitiesAt(cell) {
    return world.entities.filter( entity => Cell.isEqual(entity.cell, cell) )
  }

  function getAt(cell) {
    return World.getAt(world.data, cell)
  }

  function setAt(cell, value) {
    return World.setAt(world.data, cell, value)
  }

  function findPath(start, goal) {
    let entity = null
    if (!Array.isArray(start) && typeof start === 'object') {
      entity = start
      start = entity.cell
    }
    let cells = {}
    if (!entity) {
      for (let entity of world.entities)
        cells[entity.cell] = Infinity
    } else {
      let world = entity.world
      world.data.forEach((id, index) => {
        let cell = Cell.fromIndex(index, world.size)
        if ( !entity.known[cell] || world.entitiesAt(cell).filter(entity => !entity.walkable).length )
          cells[cell] = Infinity
      })
    }
    let costs = { tiles: World.costs, cells }
    let path = World.findPath(world.data, start, goal, costs)
    return path
  }

  function openDoor(cell) {
    let data = world.data.slice()
    let id = getAt(cell)
    if (World.tiles[id].door)
      World.setAt(data, cell, DOOR_OPEN)
    world.data = data
    return world
  }

  function closeDoor(cell) {
    let data = world.data.slice()
    let id = getAt(cell)
    if (World.tiles[id].door)
      World.setAt(data, cell, DOOR)
    world.data = data
    return world
  }

  function toggleDoor(cell) {
    let data = world.data.slice()
    let oldId = getAt(cell)
    let newId = DOOR_OPEN
    let tile = World.tiles[id]
    if (tile.door) {
      if (tile.walkable)
        newId = DOOR
      World.setAt(data, cell, newId)
    }
    world.data = data
    return world
  }

  let props   = { size, data, rooms, entities }
  let methods = { spawn, entitiesAt, getAt, setAt, findPath, openDoor, closeDoor, toggleDoor }

  let world = Object.assign({}, props, methods)
  return world

}
