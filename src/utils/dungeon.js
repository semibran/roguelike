import { RNG, Cell, Rect, Diamond, Circle, World, Actor, Item } from './index'

let rng = RNG.create()

const { FLOOR, WALL, DOOR, DOOR_OPEN, DOOR_SECRET, ENTRANCE, EXIT } = World.tileIds

export default { create }

function create(size, seed, hero) {

  if (size % 2 === 0)
    throw new RangeError(`Cannot create dungeon of even size '${size}'`)

  if (!isNaN(seed)) {
    rng.seed(seed)
  } else {
    rng = seed
    seed = rng.seed()
  }

  let world = World.create(size).fill()

  let cells = []
  let rooms = findRooms(size)
  let mazes = findMazes(size, rooms)
  let doors = findDoors(rooms, mazes)
  fillEnds(mazes)

  for (let room of rooms.list)
    for (let cell of room.cells) {
      cells.push(cell)
      world.setAt(cell, FLOOR)
    }

  for (let maze of mazes.list)
    for (let cell of maze.cells) {
      cells.push(cell)
      world.setAt(cell, FLOOR)
    }

  for (let cellId in doors.regions) {
    let cell = Cell.fromString(cellId)
    let type = DOOR
    let regions = doors.regions[cellId]
    let room = regions.sort((a, b) => a.neighbors.size - b.neighbors.size)[0]
    let neighbors = Cell.getNeighbors(cell).filter(neighbor => neighbor in mazes.ends)
    if (!neighbors.length && room.neighbors.size === 1 && rng.choose()) {
      type = DOOR_SECRET
      room.secret = true
    } else if (rng.choose())
      type = FLOOR
    world.setAt(cell, type)
  }

  let entrance = spawn(ENTRANCE, 'center')
  let exit     = spawn(EXIT, 'center')

  let enemies = rng.get(3, 5 + 1)
  while (enemies--)
    spawn(Actor.create({ kind: 'beast', faction: 'monsters', speed: 3 / 8 }))

  let items = rng.get(6, 10 + 1)
  while (items--)
    spawn(Item.create({ kind: 'item' }))

  let secretRooms = rooms.list.filter(room => room.secret)
  for (let room of secretRooms) {
    let cells = new Set(room.cells.filter(cell => world.getAt(cell) === FLOOR && !world.elementsAt(cell).length).map(Cell.toString))
    if (!cells.size)
      continue
    while (cells.size) {
      let cellId = rng.choose([...cells])
      cells.delete(cellId)
      if (rng.choose(3)) {
        let cell = Cell.fromString(cellId)
        let item = Item.create({ kind: 'item' })
        spawn(item, cell)
      }
    }
  }

  Object.assign(world, { cells, rooms, entrance, exit })

  return world

  function spawn(element, cell) {
    let center
    if (cell === 'center') {
      cell = null
      center = true
    }
    if (!cell) {
      let valid = rooms.list.filter(room => !room.secret)
      let cells
      if (center)
        cells = valid.map(room => room.center)
      else
        cells = valid.reduce((cells, room) => cells.concat(room.cells), [])
      cells = cells.filter(cell => world.getAt(cell) === FLOOR && !world.elementsAt(cell).length)
      cell = rng.choose(cells)
    }
    if (element) {
      if (!isNaN(element))
        world.setAt(cell, element)
      else
        world.spawn(element, cell)
    }
    return cell
  }

}

function findNodes(size, invalid, cells) {

  let nodes = []

  function isInvalid(cell) {
    return invalid && (cell in invalid || Cell.getNeighbors(cell, true).filter(neighbor => neighbor in invalid).length)
  }

  let i = size * size
  while (i--) {
    let cell, [x, y] = cell = Cell.fromIndex(i, size)
    if (x % 2 === 0 || y % 2 === 0 || isInvalid(cell))
      continue
    if (cells) {
      let translated = cells.map(cell => [cell[0] + x, cell[1] + y])
      let intersecting = translated.filter(cell => !Cell.isInside(cell, size) || Cell.isEdge(cell, size) || isInvalid(cell))
      if (intersecting.length)
        continue
    }
    nodes.push(cell)
  }

  return nodes
}

function findRooms(size) {

  let area = size * size

  let rooms = { cells: {}, edges: {}, list: [] }

  let min = 3, max = 7
  let total = 0
  let ratio

  do {

    let kind, matrix, cells, edges, nodes
    let fails = 0
    let failsMax = size

    do {

      kind = 'rect'
      if (rng.choose(10))
        kind = 'diamond'
      else if (rng.choose(20))
        kind = 'circle'

      if (kind === 'rect') {
        let size, [width, height] = size = [rng.get((max - min) / 2 + 1) * 2 + min, rng.get((max - min) / 2 + 1) * 2 + min]
        matrix = [0, 0, ...size]
        cells = Rect.getCells(matrix)
      } else if (kind === 'diamond') {
        let radius = rng.choose([2, 3, 4])
        matrix = [radius, radius, radius]
        cells = Diamond.getCells(matrix)
      } else if (kind === 'circle') {
        let radius = rng.choose([3, 4])
        matrix = [radius, radius, radius]
        cells = Circle.getCells(matrix)
      }

      nodes = findNodes(size, Object.assign({}, rooms.cells, rooms.edges), cells)

      if (nodes.length)
        break

      fails++

    } while (fails < failsMax)

    if (!nodes.length)
      break

    let [x, y] = rng.choose(nodes)
    matrix[0] += x
    matrix[1] += y

    let center
    if (kind === 'rect') {
      cells  = Rect.getCells(matrix)
      edges  = Rect.getEdges(matrix, true)
      center = Rect.getCenter(matrix)
    } else if (kind === 'diamond') {
      cells  = Diamond.getCells(matrix)
      edges  = Diamond.getEdges(matrix)
      center = [x, y] = matrix
    } else if (kind === 'circle') {
      cells  = Circle.getCells(matrix)
      edges  = Circle.getEdges(matrix)
      center = [x, y] = matrix
    }

    let room = { type: 'room', kind, matrix, cells, edges, center }

    for (let cell of cells)
      rooms.cells[cell] = room

    for (let cell of edges)
      rooms.edges[cell] = room

    rooms.list.push(room)

    total += cells.length
    ratio = total / area

  } while (ratio < 0.33)

  return rooms

}

function findMazes(size, rooms) {

  let mazes = { cells: {}, ends: {}, list: [] }
  let nodes = new Set(findNodes(size, rooms.cells).map(Cell.toString))

  let step = 2

  while (nodes.size) {

    let maze = { type: 'maze', cells: [], ends: [] }

    let start = Cell.fromString(rng.choose([...nodes]))
    let stack = [start]
    let backtracking = false

    while (stack.length) {

      let cell = stack[stack.length - 1]
      mazes.cells[cell] = maze
      maze.cells.push(cell)
      nodes.delete(cell.toString())

      let neighbors = Cell.getNeighbors(cell, false, step).filter(neighbor => nodes.has(neighbor.toString()))

      if (neighbors.length) {
        let neighbor = rng.choose(neighbors)
        let [cx, cy] = cell
        let [nx, ny] = neighbor
        let midpoint = [cx + (nx - cx) / step, cy + (ny - cy) / step]
        mazes.cells[midpoint] = maze
        maze.cells.push(midpoint)
        stack.push(neighbor)
        if (cell === start && !backtracking) {
          mazes.ends[cell] = maze
          maze.ends.push(cell)
        }
        backtracking = false
      } else {
        if (!backtracking) {
          mazes.ends[cell] = maze
          maze.ends.push(cell)
        }
        backtracking = true
        stack.pop()
      }

    }

    mazes.list.push(maze)

  }

  return mazes

}

function findDoors(rooms, mazes) {
  let connectorRegions = getConnectors(rooms, mazes)

  let start = rng.choose(rooms.list)
  let stack = [start]
  let doors = {}
  let main  = new Set
  let dead  = new Set

  let regions = rooms.list.concat(mazes.list)
  for (let region of regions) {
    region.neighbors = new Map
    region.doors = {}
  }

  while (stack.length) {
    let node = stack[stack.length - 1]
    main.add(node)

    let connectors
    if (node.type === 'room')
      connectors = node.edges.filter(cell => {
        if (!(cell in connectorRegions))
          return false
        let next = connectorRegions[cell].find(region => region !== node)
        return !dead.has(next) && next.cells.length > 1
      })
    else if (node.type === 'maze')
      connectors = node.cells.reduce((result, cell) => {
        return result.concat(Cell.getNeighbors(cell).filter(neighbor => neighbor in connectorRegions))
      }, [])

    connectors = connectors.filter(cell => {
      let next = connectorRegions[cell].find(region => region !== node)
      let nearby = Cell.getNeighbors(cell, true).filter(neighbor => neighbor in doors)
      return !(cell in doors) && !node.neighbors.has(next) && (!main.has(next) || rng.choose(3)) && !nearby.length
    })

    let connectorIds = connectors.map(Cell.toString)

    if (connectors.length) {
      let door = rng.choose(connectors)
      let regions = connectorRegions[door]
      let next = regions.find(region => region !== node)
      for (let cell of next.cells) {
        Cell.getNeighbors(cell).forEach(neighbor => {
          if (connectorIds.includes(neighbor.toString())) {
            delete connectorRegions[neighbor]
          }
        })
      }
      stack.push(next)
      doors[door] = regions
      main.add(node)
      connect(node, next, door)
    } else {
      stack.pop()
      if (node.type === 'maze' && node.neighbors.size === 1) {
        let next = node.neighbors.entries().next().value[0]
        let cell = node.neighbors.get(next)
        delete doors[cell]
        disconnect(node, next)
        main.delete(node)
        dead.add(node)
      }
    }
  }

  doors = {
    regions: doors,
    list: Object.keys(doors).map(Cell.fromString)
  }

  return doors

}

function getConnectors(rooms, mazes) {
  let connectorRegions = {}
  Object.keys(rooms.edges)
    .map(Cell.fromString)
    .forEach(edge => {
      let regions = new Set(Cell.getNeighbors(edge)
        .filter(neighbor => neighbor in rooms.cells || neighbor in mazes.cells)
           .map(neighbor =>   rooms.cells[neighbor] || mazes.cells[neighbor]  ))
      if (regions.size >= 2)
        connectorRegions[edge] = [...regions]
    })
  return connectorRegions
}

function connect(node, next, door) {
  connectOne(node, next, door)
  connectOne(next, node, door)
}

function connectOne(node, next, door) {
  node.neighbors.set(next, door)
  node.doors[door] = next
}

function disconnect(node, next) {
  disconnectOne(node, next)
  disconnectOne(next, node)
}

function disconnectOne(node, next) {
  let connector = node.neighbors.get(next)
  delete node.doors[connector]
}

function fillEnds(mazes) {
  mazes.ends = {}
  for (let maze of mazes.list) {
    let cells = new Set(maze.cells.map(Cell.toString))
    let ends  = []
    let stack = maze.ends
    while (stack.length) {
      let cell = stack.pop()
      let neighbors = Cell.getNeighbors(cell).filter(neighbor => neighbor in mazes.cells || neighbor in maze.doors)
      if (neighbors.length > 1) {
        ends.push(cell)
        continue
      }
      cells.delete(cell.toString())
      delete mazes.cells[cell]
      let next = neighbors[0]
      if (next)
        stack.unshift(next)
    }
    maze.cells = [...cells].map(Cell.fromString)
    maze.ends  = ends = ends
      .filter(cell => cell in mazes.cells && Cell.getNeighbors(cell).filter(neighbor => neighbor in mazes.cells).length === 1)
    ends.forEach(cell => mazes.ends[cell] = maze)
  }
}
