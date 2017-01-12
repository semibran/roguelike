import { Random, World, Cell, Rect } from './index'

const { FLOOR, WALL, DOOR, DOOR_OPEN, MARKER } = World

export default { createDungeon }

function findRoom(min, max, worldSize) {
  var w = Random.get((max - min) / 2 + 1) * 2 + min
  var h = Random.get((max - min) / 2 + 1) * 2 + min
  var x = Random.get((worldSize - w) / 2) * 2 + 1
  var y = Random.get((worldSize - h) / 2) * 2 + 1
  return [x, y, w, h]
}

function findRooms(data, maxRatio) {
  maxRatio = maxRatio || 0.33
  let size = World.getSize(data)
  let area = size * size
  let min = Math.round(size / 5)
  let max = Math.round(size / 4)
  let rooms = { cells: {}, edges: {}, rects: {}, list: [] }
  let tries = 0
  let total = 0
  let valid
  do {
    let room = { cells: {}, edges: {}, rect: null, type: 'room' }
    do {
      valid = true
      room.rect = findRoom(min, max, size)
      for (let other of rooms.list)
        if ( Rect.isIntersecting(room.rect, other.rect) ) {
          valid = false
          break
        }
    } while (!valid && ++tries < area)
    if (valid) {
      let rect  = room.rect
      let cells = Rect.getCells(rect)
      let edges = Rect.getEdges(rect, true)
      for (let cell of cells)
        rooms.cells[cell] = room.cells[cell] = room
      for (let edge of edges) {
        let sharedEdges = rooms.edges[edge] = room.edges[edge] = room.edges[edge] || []
        sharedEdges.push(room)
      }
      rooms.rects[rect] = room
      rooms.list.push(room)
      total += cells.length
    }
  } while (valid && total / area < maxRatio)
  return rooms
}

function findNodes(data) {
  let size = World.getSize(data)
  let nodes = new Set
  let half = (size - 1) / 2
  let i = half * half
  while (i--) {
    let [nodeX, nodeY] = Cell.fromIndex(i, half)
    let node = [nodeX * 2 + 1, nodeY * 2 + 1]
    if (World.getAt(data, node) === WALL)
      nodes.add( node.toString() )
  }
  return nodes
}

function findMazes(data) {
  let size = World.getSize(data)
  let mazes = { cells: {}, ends: {}, list: [] }
  let nodes = findNodes(data)
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
      let neighbors = Cell.getNeighbors(node, false, 2).filter( (neighbor) => World.getAt(data, neighbor) === WALL && !(neighbor.toString() in maze.cells) )
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

  let disconnected = new Set(rooms.list)

  let connectorRegions = findConnectors(data, rooms, mazes)
  let start = Random.choose(rooms.list)
  let stack = [start]
  let track = [start] // Queue for backtracking
  let total = [start] // Total list of regions
  let doors = []      // Resulting doors

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
        let chance = Random.choose(25)
        if ( chance || !total.includes(next) )
          connectors[id] = next
      }
    }
    return connectors
  }

  while (stack.length) {
    let node = stack.pop()
    if ( node.type === 'room' && disconnected.has(node) )
      disconnected.delete(node)
    let connectors = getConnectors(node)
    let connectorKeys = Object.keys(connectors)
    if (connectorKeys.length) {
      let connector = Random.choose(connectorKeys)
      // console.log(connector)
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
        total.push(next)
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
      doors.push(edge)
    }
  }

  return doors

}

function fillEnds(data, ends) {
  let stack = Object.keys(ends).map(Cell.fromString)
  while (stack.length) {
    let cell = stack.pop()
    let neighbors = Cell.getNeighbors(cell)
    let escapes = []
    for (let neighbor of neighbors) {
      let id = World.getAt(data, neighbor)
      if (id === FLOOR || id === DOOR)
        escapes.push(neighbor)
    }
    if (escapes.length === 1) {
      World.setAt(data, cell, WALL)
      stack.push( escapes[0] )
    }
  }
}

function createDungeon(size) {

  if (!size % 2)
    throw new RangeError(`Cannot create dungeon of even size ${size}`)

  let data = World.fill( World.create(size) )
  let entities = new Set
  let spawns = []

  let rooms = findRooms(data)
  for (let room of rooms.list)
    for (let id in room.cells)
      World.setAt(data, Cell.fromString(id), FLOOR)

  let mazes = findMazes(data)
  for (let maze of mazes.list)
    for (let id in maze.cells)
      World.setAt(data, Cell.fromString(id), FLOOR)

  let doors = findDoors(data, rooms, mazes)
  for (let id of doors)
    World.setAt(data, Cell.fromString(id), DOOR)

  fillEnds(data, mazes.ends)

  while (spawns.length < 10) {
    let room = Random.choose(rooms.list)
    let cell = Random.choose(room.cells)
    if ( !spawns.includes(cell) )
      spawns.push(cell)
  }
  spawns = spawns.map(Cell.fromString)

  function spawn(item, cell) {
    if (!cell) {
      let room = Random.choose(world.rooms.list)
      cell = Cell.fromString( Random.choose(room.cells) )
    }
    if ( !isNaN(item) ) {
      World.setAt(world.data, cell, item)
    } else if (typeof item === 'object') {
      item.world = world
      item.cell  = cell
      item.look()
      entities.add(item)
    }
    return cell
  }

  let props   = { size, data, rooms, entities, spawns }
  let methods = { spawn }

  let world = Object.assign({}, props, methods)
  return world

}
