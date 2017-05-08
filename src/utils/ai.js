import { Cell } from './index'

export default { create }

function create(rng) {

  return { getAction }

  function getAction(actor) {
    if (!actor.goal || Cell.isEqual(actor.cell, actor.goal)) {
      let cells = [...actor.world.rooms.list].filter(room => !room.secret).reduce((cells, room) => cells.concat(room.cells), []).filter(cell => !Cell.isEqual(actor.cell, cell))
      actor.goal = rng.choose(cells)
      actor.path = actor.world.findPath(actor.cell, actor.goal)
    }
    let step = actor.world.findStep(actor.path, actor.cell)
    if (!step)
      return null
    return { type: 'action', kind: 'move', data: [step] }
  }

}
