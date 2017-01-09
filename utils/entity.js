import World  from './world'
import Vector from './vector'
import Pos    from './pos'
import FOV    from './fov'

export default { create }

function create(sprite) {

  var known = {}
  var entity = { sprite, pos: null, world: null, look, seeing: null, known, vision: 5, spawned: false, spawn, move, moveTo }

  return entity

  function spawn(world, pos) {
    if (entity.spawned)
      return null
    entity.world = world
    entity.pos = Vector.create(pos)
    entity.spawned = true
    look()
    return entity
  }

  function look() {
    var {world, pos, vision} = entity
    var tiles = FOV.get(world, pos, vision)
    var entities = world.entities.filter(other => tiles.includes(other.pos.toString()))
    for (var key of tiles) {
      var tile = World.tiles[world.get(key.split(',').map(Number))]
      known[key] = tile.sprite
    }
    entities.forEach((entity) => (known[entity.pos.toString()] = entity.sprite))
    entity.seeing = tiles
  }

  function move() {

  }

  function moveTo(pos) {
    entity.pos.set(pos)
    look()
  }

}
