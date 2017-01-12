import { Cell, World, FOV } from './index'

export default { create }

function create(sprite) {

  let path = null

  function look() {
    let cells = FOV.get(entity.world.data, entity.cell)
    entity.seeing = {}
    for (var cell of cells) {
      entity.known[cell] = World.tiles[ World.getAt(entity.world.data, cell) ].name
      entity.seeing[cell] = true
    }
  }

  function move(direction) {
    let moved = false
    let world = entity.world
    let [cellX, cellY] = entity.cell
    let [distX, distY] = direction
    let target = [cellX + distX, cellY + distY]
    let id = World.getAt(world.data, target)
    let tile = World.tiles[id]
    if (tile.walkable) {
      entity.cell = target
      moved = true
      look()
    } else if (tile.door) {
      world.data = World.openDoor(world.data, target)
      moved = false
      look()
    }
    return moved
  }

  function moveTo(target) {
    if ( !path || path[path.length - 1] !== target )
      path = World.findPath(entity.world.data, entity.cell, target)
    if (!path)
      return false
    let next
    path.some(function(cell, index) {
      if ( !Cell.isEqual(entity.cell, cell) )
        return
      next = path[index + 1]
      return true
    })
    if (!next)
      return false
    let [cellX, cellY] = entity.cell
    let [nextX, nextY] = next
    let dist = [nextX - cellX, nextY - cellY]
    return entity.move(dist)
  }

  let props   = { sprite, seeing: [], known: {}, world: null, cell: null }
  let methods = { look, move, moveTo }
  let entity  = Object.assign({}, props, methods)

  return entity
}
