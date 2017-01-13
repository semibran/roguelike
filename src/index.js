import { Dungeon, World, Entity, Item, Cell, Rect, RNG, Colors } from './utils/index'

const WORLD_SIZE = 25
const { FLOOR, WALL, DOOR, DOOR_OPEN, DOOR_HIDDEN, STAIRS, TRAP } = World
const { RED, MAROON, YELLOW, OLIVE, LIME, GREEN, CYAN, TEAL, BLUE, NAVY, MAGENTA, PURPLE, WHITE, GRAY, BLACK } = Colors

const sprites = {

  // Tiles
  floor:       [String.fromCharCode(183), TEAL],
  wall:        ['#', OLIVE],
  door:        ['+', MAROON],
  door_open:   ['/', MAROON],
  door_secret: ['#', OLIVE],
  stairs:      ['>', WHITE],
  trap:        ['^', MAGENTA],

  // Entities
  human:       ['@', WHITE],
  wyrm:        ['w', LIME],
  replica:     ['J', BLUE],

  // Items
  gold:        ['$', YELLOW],
  silver:      ['$', WHITE],
  copper:      ['$', MAROON]

}

// TODO: Change these to key/value pairs with data on each enemy
const enemies = ['wyrm', 'replica']

// Use `RNG.create(seed)` to seed the RNG, where `seed` is some
// number like `9820.083045702477`. Seeding the RNG allows you
// to achieve the same dungeon multiple times for debugging.
//
// Leave empty for a random seed.
//
const rng = RNG.create()

function spawnEnemies(world) {
  let i = 10
  while (i--) {
    let kind = rng.choose(enemies)
    let options = { entityType: 'enemy', kind }
    let enemy = Entity.create(options)
    world.spawn(enemy)
  }
}

let money = {
  copper: {
    range: [4, 16]
  },
  silver: {
    range: [32, 128],
    chance: 0.10
  },
  gold: {
    range: [256, 1024],
    chance: 0.01
  }
}
function spawnMoney(world) {

  let i = 10

  while (i--) {

    let num = rng.get(100) + 1
    let lowest = 1
    let rarest = null
    for (let kind in money) {
      let { range, chance } = money[kind]
      if (!chance)
        chance = 1
      if (chance <= lowest && num <= chance * 100) {
        lowest = chance
        rarest = kind
      }
    }

    let kind  = rarest
    let value = rng.get(money[kind].range)

    let options = { itemType: 'money', kind, value }
    let item = Item.create(options)

    world.spawn(item)

  }

}

function generate() {
  let world = Dungeon.create(WORLD_SIZE, rng)
  let hero = Entity.create( { entityType: 'hero', kind: 'human' } )
  world.spawn(hero)
  world.spawn(STAIRS, 'center')
  world.spawn(TRAP)
  spawnEnemies(world)
  spawnMoney(world)
  for (let entity of world.entities)
    entity.look()
  return {world, hero}
}

new Vue({
  el: '#app',
  data: function () {
    return Object.assign(generate(), { log: [], debug: false })
  },
  methods: {
    onclick: function (index) {
      let {world, hero, debug} = this
      let cell = hero.cell
      let targetX = index % WORLD_SIZE
      let targetY = (index - targetX) / WORLD_SIZE
      let target = [targetX, targetY]

      if ( Cell.isEqual(cell, target) ) {
        if (world.getAt(cell) === STAIRS)
          this.descend()
        return
      }

      if ( !hero.known[target] && !debug )
        return

      function move() {
        let moved = hero.moveTo(target)
        if (moved)
          window.requestAnimationFrame(move)
      }
      move()

    },
    ascend: function () {

    },
    descend: function () {
      let generation = generate()
      this.world = generation.world
      this.hero  = generation.hero
    }
  },
  computed: {
    view: function () {
      let {world, hero, debug} = this
      let view = []
      world.data.forEach((id, index) => {
        let cell = Cell.fromIndex(index, WORLD_SIZE)
        let char = ' ', color
        let type = hero.known[cell]
        if (!type && debug)
          type = World.tiles[ world.getAt(cell) ].name
        if (type) {
          [char, color] = sprites[type]
          if ( !hero.seeing[cell] )
            color = GRAY
          if ( Array.isArray(color) )
            color = `rgb(${color.join(', ')})`
        }
        view.push( {char, color} )
      })
      return view
    }
  },
  mounted: function () {
    let vue = this
    vue.$el.style.fontSize = `calc(100vmin / ${WORLD_SIZE})`
    function handleKeys(event) {
      let flag = event.type === 'keydown'
      if (event.code === 'Space' && vue.debug !== flag) {
        vue.debug = flag
      }
    }
    window.addEventListener('keydown', handleKeys)
    window.addEventListener('keyup',   handleKeys)
  },
  components: {
    game: {
      template: '#game-template',
      props: ['view', 'onclick']
    }
  }
})
