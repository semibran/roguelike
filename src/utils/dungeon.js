import { RNG, World, Cell, Rect } from './index'

const { FLOOR, WALL, DOOR, DOOR_OPEN, DOOR_SECRET, STAIRS, TRAP } = World

export default { create }

let rng = RNG.create()

function findRoom(min, max, worldSize) {
  let w = rng.get((max - min) / 2 + 1) * 2 + min
  let h = rng.get((max - min) / 2 + 1) * 2 + min
  let x = rng.get((worldSize - w) / 2) * 2 + 1
  let y = rng.get((worldSize - h) / 2) * 2 + 1
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

  function getData(shape) {
    switch (shape) {
      case 'rect': {
        let matrix = findRoom(3, 9, size)
        return [matrix, Rect.getBorder(matrix, true)]
      }
      case 'diamond': {
        let matrix = findDiamondRoom(2, 6, size)
        return [matrix, Diamond.getEdges(matrix)]
      }
    }
  }

  while (valid && total / area < maxRatio) {
    let shape = 'rect'
    let matrix
    do {
      let cells
      if ( rng.choose(50) ) {
        shape = 'diamond'
      }
      [matrix, cells] = getData(shape)
      if (matrix in cached) {
        valid = false
        continue
      }
      cached[matrix] = valid = validate(cells)
    } while (!valid && ++fails < area)
    if (valid) {
      let edges, room = { edges: {}, shape, matrix, type: 'room' }
      if (shape === 'rect') {
        edges = Rect.getBorder(matrix, true)
        room.cells  = Rect.getCells(matrix)
        room.center = Rect.getCenter(matrix)
        rooms.rects[matrix] = room
      } else if (shape === 'diamond') {
        edges = Diamond.getEdges(matrix)
        room.cells  = Diamond.getCells(matrix)
        room.center = Diamond.getCenter(matrix)
        rooms.diamonds[matrix] = room
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
    room.connections = new Set

  for (let maze of mazes.list)
    maze.connections = new Set

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

        node.connections.add(next)
        next.connections.add(node)
      }
    } else {
      if (node.type === 'maze' && node.connections.length === 1) {
        let last = node.connections.entries().next().value
        last.connections.delete(node)
        connected.delete(node)
      }
      while (track.length) {
        let next = track.pop()
        if (next && next !== node) {
          stack.push(next)
          track.push(next)
          // console.log('Backtracking to', next.type)
          break
        }
      }
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
    if (node.type === 'room') {
      for (let id in node.edges)
        if (id in connectorRegions)
          prospects.push(id)
    } else if (node.type === 'maze') {
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
        let lucky = rng.choose(5)
        let isIncluded  = id in doorRegions
        let isConnected = node.connections.has(next)
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
  for (let room of rooms.list)
    for (let cell of room.cells)
      World.setAt(data, cell, FLOOR)

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
    let room = regions.filter(region => region.type !== 'maze')[0]
    let type = DOOR
    let neighbors = Cell.getNeighbors(cell).filter( neighbor => endKeys.includes( neighbor.toString() ) )
    if ( !neighbors.length && rng.choose() ) {
      type = DOOR_SECRET
      rooms.normal.delete(room)
      rooms.secret.add(room)
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

  function spawn(element, cell) {
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
      } while (elementsAt(cell).length && getAt(cell) === FLOOR)
    }
    if ( !isNaN(element) )
      setAt(cell, element)
    else if (typeof element === 'object') {
      element.world = world
      element.cell  = cell
      getList(element).push(element)
    }
    return cell
  }

  function getList(element) {
    switch (element.type) {
      case 'entity':
        return world.entities
      case 'item':
        return world.items
      default:
        return null
    }
  }

  function kill(element) {
    let list = getList(element)
    if (!list)
      return false
    let index = list.indexOf(element)
    if (index < 0)
      return false
    list.splice(index, 1)
    return true
  }

  function elementsAt(cell) {
    return entitiesAt(cell).concat(itemsAt(cell))
  }

  function entitiesAt(cell) {
    return world.entities.filter( entity => Cell.isEqual(entity.cell, cell) )
  }

  function itemsAt(cell) {
    return world.items.filter(   item => Cell.isEqual(  item.cell, cell) )
  }


  function getAt(cell) {
    return World.getAt(world.data, cell)
  }

  function getTileAt(cell) {
    return World.tiles[ getAt(cell) ]
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

  let props   = { size, data, rooms, entities: [], items: [] }
  let methods = { spawn, kill, elementsAt, entitiesAt, itemsAt, getAt, getTileAt, setAt, findPath, openDoor, closeDoor, toggleDoor }

  let world = Object.assign({}, props, methods)
  return world

}
