import { Cell, World, FOV } from './index'

export default { create }

function create(type, sprite, walkable) {

  walkable = !!walkable

  let path = null

  function look() {
    let cells = FOV.get(entity.world.data, entity.cell, 7)
    entity.seeing = {}
    for (var cell of cells) {
      let type = World.tiles[ entity.world.getAt(cell) ].name
      let other = entity.world.entitiesAt(cell)[0]
      if (other)
        type = other.type
      entity.known[cell] = type
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
    if (tile.walkable) {
      let enemies = entities.filter(entity => !entity.walkable)
      if (!enemies.length) {
        entity.cell = target
        moved = true
        look()
      } else {
        let enemy = enemies[0]
        attack(enemy)
      }
    } else if (tile.door) {
      world.openDoor(target)
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

  function attack(entity) {
    entity.health--
    if (entity.health <= 0){
      let entities = entity.world.entities
      let index = entities.indexOf(entity)
      if (index !== -1)
        entities.splice(index, 1)
      look()
    }
  }

  let props   = { type, sprite, walkable, wandering: true, health: 1, seeing: {}, known: {}, world: null, cell: null }
  let methods = { look, move, moveTo }
  let entity  = Object.assign({}, props, methods)

  return entity
}
