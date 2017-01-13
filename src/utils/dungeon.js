import { RNG, World, Cell, Rect } from './index'

const { FLOOR, WALL, DOOR, DOOR_OPEN, DOOR_SECRET, STAIRS } = World

export default { create }

let rng = RNG.create()

function findRoom(min, max, worldSize) {
  var w = rng.get((max - min) / 2 + 1) * 2 + min
  var h = rng.get((max - min) / 2 + 1) * 2 + min
  var x = rng.get((worldSize - w) / 2) * 2 + 1
  var y = rng.get((worldSize - h) / 2) * 2 + 1
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

  return { getCells, getEdges, getCenter }

}()

function findDiamondRoom(min, max, worldSize) {
  let radius = rng.get((max - min) / 2 + 1) * 2 + min
  let nodes = findNodes(worldSize, radius).map(Cell.fromString)
  let diamond = rng.choose(nodes)
  diamond.push(radius)
  return diamond
}

function findRooms(data, maxRatio) {
  maxRatio = maxRatio || 0.33
  let size = World.getSize(data)
  let area = size * size
  let min = Math.round(size / 5)
  let max = Math.round(size / 4)
  let valid = true
  let rooms = { cells: {}, edges: {}, rects: {}, diamonds: {}, normal: new Set, secret: new Set, list: [] }
  let total = 0
  let fails = 0
  let cached = {}

  function validate(cells) {
    for (let cell of cells)
      if (rooms.cells[cell] || rooms.edges[cell])
        return false
    return true
  }

  while (valid && total / area < maxRatio) {
    let type = 'rect'
    let shape
    do {
      let cells
      if ( rng.choose(50) )
        type = 'diamond'
      if (type === 'rect') {
        shape = findRoom(min, max, size)
        cells = Rect.getBorder(shape)
      } else if (type === 'diamond') {
        shape = findDiamondRoom(2, 4, size)
        cells = Diamond.getEdges(shape)
      }
      if (shape in cached) {
        valid = false
        continue
      }
      valid = validate(cells)
      cached[shape] = valid
    } while (!valid && ++fails < area)
    if (valid) {
      let room, edges
      room = { edges: {}, shape, type }
      if (type === 'rect') {
        edges = Rect.getEdges(shape, true)
        room.cells  = Rect.getCells(shape)
        room.center = Rect.getCenter(shape)
        rooms.rects[shape] = room
      } else if (type === 'diamond') {
        edges = Diamond.getEdges(shape)
        room.cells  = Diamond.getCells(shape)
        room.center = Diamond.getCenter(shape)
        rooms.diamonds[shape] = room
      }
      for (let cell of room.cells)
        rooms.cells[cell] = room
      for (let edge of edges) {
        let sharedEdges = room.edges[edge] = rooms.edges[edge] = rooms.edges[edge] || []
        sharedEdges.push(room)
      }
      rooms.normal.add(room)
      rooms.list.push(room)
      total += room.cells.length
    }

  }
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
    let start = rng.choose( [...nodes] )
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
        let neighbor = rng.choose(neighbors)
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
  let start = rng.choose(rooms.list)
  let stack = [start]
  let track = [start]
  let doorRegions = {}

  let disconnected = new Set(rooms.list)
  let connected = new Map

  for (let room of rooms.list)
    room.connections = []

  for (let maze of mazes.list)
    maze.connections = []

  while (stack.length) {
    let node = stack.pop()
    if ( rooms.list.includes(node) && disconnected.has(node) )
      disconnected.delete(node)
    let connectors = getConnectors(node)
    let connectorKeys = Object.keys(connectors)
    if (connectorKeys.length) {
      let connector = rng.choose(connectorKeys)
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

        doorRegions[connector] = [node, next]

        stack.push(next)
        track.push(next)

        node.connections.push(next)
        next.connections.push(node)
      }
    } else {
      let nodeConnections = connected.get(node)
      if (nodeConnections && nodeConnections.length === 1) {
        let last = nodeConnections[0]
        let lastConnections = connected.get(last)
        lastConnections.splice(lastConnections.indexOf(node), 1)
        connected.delete(node)
      }
      let next = track.pop()
      if (next && next !== node)
        stack.push(next)
    }
  }

  let i = 2
  while (i--)
    for (let room of disconnected) {
      let edges = Object.keys(room.edges).filter(edge => edge in connectorRegions && getNext(connectorRegions[edge], room).connections.length)
      if (edges.length) {
        let connector = rng.choose(edges)
        let next = getNext(connectorRegions[connector], room)
        doorRegions[connector] = [room, next]
        room.connections.push(next)
        next.connections.push(room)
        disconnected.delete(room)
      }
    }

  // for (let connector in connectorRegions)
  //   World.setAt(data, Cell.fromString(connector), DOOR_OPEN)

  return doorRegions

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
      // console.log(node.type, node.shape)
      for (let id in node.edges)
        if (id in connectorRegions)
          prospects.push(id)
    } else if (node.type === 'maze') {
      // console.log(node.type, Object.keys(node.cells).length)
      for (let id in node.cells) {
        let cell = Cell.fromString(id)
        let neighbors = Cell.getNeighbors(cell)
        for (let neighbor of neighbors) {
          if (neighbor in connectorRegions)
            prospects.push(neighbor.toString())
        }
      }
    }
    for (let id of prospects) {
      let cell = Cell.fromString(id)
      let regions = connectorRegions[id]
      let next = getNext(regions, node)
      if (next) {
        let lucky = rng.choose(10)
        let isIncluded  = id in doorRegions
        let isConnected = node.connections.includes(next)
        let isMain      = connected.has(next) && !lucky
        let nearby      = !!Cell.getNeighbors(cell, true).filter(neighbor => neighbor in doorRegions).length
        if (!isIncluded && !isConnected && !isMain && !nearby)
          connectors[id] = next
      }
    }
    return connectors
  }

}

function fillEnds(data, mazes, doors) {
  let stack = Object.keys(mazes.ends).map(Cell.fromString)
  let ends = []
  while (stack.length) {
    let cell = stack.pop()
    let escapes = Cell.getNeighbors(cell).filter( neighbor => World.getTileAt(data, neighbor).walkable || neighbor in doors )
    if (escapes.length <= 1) {
      delete mazes.cells[cell]
      World.setAt(data, cell, WALL)
      if (escapes.length)
        stack.push( escapes[0] )
    } else {
      ends.push(cell)
    }
  }
  ends = ends.filter(end => World.getAt(data, end) === FLOOR && Cell.getNeighbors(end).filter( neighbor => World.getTileAt(data, neighbor).walkable ).length === 1)
  return ends
}

function generate(size, seed) {

  let data = World.fill( World.create(size) )

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

  let ends = fillEnds(data, mazes, doors)
  let endKeys = ends.map(Cell.toString)

  for (let id in doors) {
    let cell = Cell.fromString(id)
    let regions = doors[id]
    let room = regions[0]
    let type = DOOR
    let neighbors = Cell.getNeighbors(cell).filter( neighbor => endKeys.includes( neighbor.toString() ) )
    if ( !neighbors.length && rooms.list.includes(room) && rng.choose() ) {
      type = DOOR_SECRET
      rooms.normal.delete(room)
      rooms.secret.add(room)
      // console.log(cell)
    } else if ( rng.choose(5) )
      type = FLOOR
    World.setAt(data, cell, type)
  }

  return {data, rooms}

}

function create(size, seed) {

  if (!size % 2)
    throw new RangeError(`Cannot create dungeon of even size ${size}`)

  if (typeof seed === 'object') {
    rng = seed
    seed = rng.seed()
  } else if ( isNaN(seed) ) {
    seed = rng.get()
    rng.seed(seed)
  }

  console.log('Seed:', seed)

  let {data, rooms} = generate(size, seed)
  let entities = []

  function spawn(item, cell) {
    if (!world.rooms)
      return null
    if (typeof cell !== 'object') {
      let valid
      do {
        let room = rng.choose( [...world.rooms.normal] )
        if (cell !== 'center')
          cell = rng.choose(room.cells)
        else
          cell = room.center
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
