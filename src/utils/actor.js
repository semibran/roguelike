import { Cell, FOV, World } from './index'

const { DOOR, DOOR_OPEN, ENTRANCE, EXIT } = World.tileIds

export default { create }

function create(options) {

  let actor = {
    kind: null,
    faction: null,
    speed: 1 / 2,
    intel: 1 / 2,
    vision: 7
  }

  Object.assign(actor, options, {
    type: 'actor', world: null, cell: null, path: null, energy: 0, health: 1, known: {}, seeing: {},
    perform, move, attack, collect, open, descend, ascend, look
  })

  return actor

  function perform(action) {
    let { kind, data } = action
    switch (kind) {
      case 'move':    return move(...data)
      case 'attack':  return attack(...data)
      case 'collect': return collect(...data)
      case 'open':    return open(...data)
      case 'close':   return close(...data)
      case 'descend': return descend(...data)
      case 'ascend':  return ascend(...data)
      case 'wait':    return true
    }
    throw new TypeError(`Unrecognized action kind: ${kind}`)
    return null
  }

  function move(direction) {
    if (!actor.cell)
      throw new TypeError(`Cannot move actor ${actor.kind} of cell ${actor.cell}`)
    let [cx, cy] = actor.cell
    let [dx, dy] = direction
    let target = [cx + dx, cy + dy]
    let tile = actor.world.tileAt(target)
    if (!tile.walkable)
      if (tile.door && actor.intel >= 1 / 2)
        return target // Tile is a door
      else
        return false // Can't move to that tile
    let elements = actor.world.elementsAt(target)
    let other = elements.find(element => element.type === 'actor')
    if (other)
      return other // There's another actor in the way (sort?)
    actor.cell = target
    let item = elements.find(element => element.type === 'item')
    if (item)
      return item // There's an item on the ground.
    return true // Successfully moved with no complications
  }

  function attack(target) {
    if (!target || target.type !== 'actor' || !Cell.isNeighbor(actor.cell, target.cell))
      return false
    target.health--
    if (target.health <= 0) {
      target.health = 0
      target.world.kill(target)
      target.world.spawn({
        type: 'sprite',
        kind: 'corpse',
        origin: target.kind
      }, target.cell)
    }
    return true // This action cannot fail
  }

  function collect(target) {
    target.world.kill(target)
  }

  function open(target) {
    if (!Cell.isCell(target) || !Cell.isNeighbor(actor.cell, target))
      return false
    let tile = actor.world.tileAt(target)
    if (!tile.door)
      return false
    actor.world.setAt(target, DOOR_OPEN)
    return true
  }

  function close(target) {
    if (!target) {
      let neighbors = Cell.getNeighbors(actor.cell, true).filter(neighbor => actor.world.getAt(neighbor) === DOOR_OPEN)
      if (!neighbors.length)
        return false
      for (let neighbor of neighbors)
        actor.world.setAt(neighbor, DOOR)
      return true
    } else {
      if (!Cell.isCell(target) || !Cell.isNeighbor(actor.cell, target))
        return false
      let tile = actor.world.tileAt(target)
      if (!tile.door)
        return false
      actor.world.setAt(target, DOOR)
      return true
    }
  }

  function descend() {
    let id = actor.world.getAt(actor.cell)
    if (id === EXIT)
      return true
    return false
  }

  function ascend() {
    let id = actor.world.getAt(actor.cell)
    if (id === ENTRANCE)
      return true
    return false
  }

  function look() {
    let cells = FOV.get(actor.world, actor.cell, actor.vision)
    actor.seeing = {}
    if (!actor.known[actor.worldId])
      actor.known[actor.worldId] = {}
    for (var cell of cells) {
      let kind = actor.world.tileAt(cell).kind
      let other = actor.world.elementsAt(cell)[0]
      if (other)
        kind = other.kind
      actor.known[actor.worldId][cell] = kind
      actor.seeing[cell] = true
    }
  }

}
