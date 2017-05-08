import { RNG, Actor, AI, Dungeon, Cell } from './index'

let eventCallbacks = {}

const SUCCESS = true
const FAILURE = false

export default { create }

function create(size, seed) {

  let rng = RNG.create(seed)
  let ai = AI.create(rng)

  let index = 0

  let game = {
    rng, world: {}, floor: null, hero: null,
    start, on, off, input
  }

  return game

  function start() {
    game.world = {}
    game.floor = 0
    game.hero = Actor.create({ kind: 'human', faction: 'hero' })
    descend()
    output('start')
    return game
  }

  function tick() {
    let actor, actors = [...game.world[game.floor].elements].filter(element => element.type === 'actor')
    if (!actors.length)
      return null
    while (game.hero.health) {
      index = index % actors.length
      actor = actors[index]
      if (actor.health) {
        if (actor.energy < 1)
          actor.energy += actor.speed
        while (actor.energy >= 1) {
          actor.look()
          let action = actor.action
          if (!action) {
            if (actor === game.hero)
              return output('tick')
            action = ai.getAction(actor)
            if (!action)
              return output('tick')
          }
          let { kind, data } = action
          let result = actor.perform(action)
          if (result !== SUCCESS) {
            if (!result || result === FAILURE) {
              if (actor === game.hero)
                return output(`${kind}-fail`, actor, ...data)
            }
            if (result.type === 'actor') {
              actor.attack(result)
              kind = 'attack'
              data = [result]
            } else if (result.type === 'item') {
              output(kind, actor, ...data)
              actor.collect(result)
              kind = 'item'
              data = [result]
            } else if (Cell.isCell(result)) {
              actor.open(result)
              kind = 'open'
              data = [result]
            }
          } else {
            if (kind === 'descend' || kind === 'ascend') {
              actor.action = null
              if (kind === 'descend')
                result = descend()
              else if (kind === 'ascend')
                result = ascend()
              if (result === FAILURE) {
                output(`${kind}-fail`, actor, ...data)
                return
              }
            }
          }
          actor.action = null
          actor.energy--
          if (result !== FAILURE)
            output(kind, actor, ...data)
        }
      }
      index++
    }
    game.hero.look()
    return output('tick')
  }

  function descend() {
    if (game.hero.world)
      game.hero.world.kill(game.hero)
    game.floor++
    let floor
    if (game.world[game.floor])
      floor = game.world[game.floor]
    else {
      floor = Dungeon.create(size, rng)
      game.world[game.floor] = floor
    }
    floor.spawn(game.hero, floor.entrance)
    game.hero.worldId = game.floor
    tick()
    return true
  }

  function ascend() {
    if (!game.world[game.floor - 1])
      return false
    game.hero.world.kill(game.hero)
    game.floor--
    let floor = game.world[game.floor]
    floor.spawn(game.hero, floor.exit)
    game.hero.worldId = game.floor
    tick()
    return true
  }

  function on(event, callback) {
    let events = event
    if (!Array.isArray(event))
      events = [event]
    for (let event of events) {
      let callbacks = eventCallbacks[event]
      if (!callbacks)
        callbacks = eventCallbacks[event] = new Set
      callbacks.add(callback)
    }
    return game
  }

  function off(event, callback) {
    let callbacks = eventCallbacks[event]
    if (!callbacks)
      return false
    callbacks.delete(callback)
    return true
  }

  function input(kind, ...data) {
    if (!game.hero.health)
      return false
    game.hero.action = { type: 'action', kind, data }
    tick()
    return true
  }

  function output(event, ...data) {
    let callbacks = eventCallbacks[event]
    if (!callbacks)
      return false
    for (let callback of callbacks)
      callback(...data)
    return true
  }

}
