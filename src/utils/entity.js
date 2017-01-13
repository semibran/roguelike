import { Cell, World, FOV } from './index'

export default { create }

function create(options) {

  let entity = {
    entityType: null,
    kind: null
  }

  let props = {
    type: 'entity',
    wandering: true,
    health: 1,
    seeing: {},
    known: {},
    world: null,
    cell: null
  }

  Object.assign(entity, options, props)

  let path = null

  function look() {
    let cells = FOV.get(entity.world.data, entity.cell, 7)
    entity.seeing = {}
    for (var cell of cells) {
      let kind = World.tiles[ entity.world.getAt(cell) ].name
      let other = entity.world.elementsAt(cell)[0]
      if (other)
        kind = other.kind
      entity.known[cell] = kind
      entity.seeing[cell] = true
    }
  }

  function move(direction) {
    let moved = false
    let world = entity.world
    let [cellX, cellY] = entity.cell
    let [distX, distY] = direction
    let target = [cellX + distX, cellY + distY]
    let id = world.getAt(target)
    let tile = World.tiles[id]
    let entities = world.entitiesAt(target)
    let items    = world.itemsAt(target)
    if (entities.length) {
      let enemy = entities[0]
      attack(enemy)
    } else if (tile.walkable) {
      if (!entities.length) {
        entity.cell = target
        world.emit('move', entity, target)
        if (items.length) {
          let item = items[0]
          entity.collect(item)
        } else {
          moved = true
        }
        look()
      }
    } else if (tile.door) {
      world.openDoor(target, entity)
      look()
    }
    return moved
  }

  function moveTo(target) {
    if ( !path || path[path.length - 1] !== target )
      path = entity.world.findPath(entity, target)
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

  function attack(other) {
    other.health--
    entity.world.emit('attack', entity, other)
    if (other.health <= 0){
      entity.world.kill(other)
      look()
    }
  }

  function collect(item) {
    if ( Cell.isEqual(entity.cell, item.cell) ) {
      entity.world.kill(item)
      entity.world.emit('item', entity, item)
    }
  }

  let methods = { look, move, moveTo, attack, collect }
  return Object.assign(entity, methods)
}
