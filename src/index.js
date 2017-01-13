import { Dungeon, World, Entity, Item, Cell, Rect, RNG, Colors } from './utils/index'

const DISPLAY_SIZE = 25
const WORLD_SIZE = DISPLAY_SIZE
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
  slime:       ['j', BLUE],

  // Items
  gold:        ['$', YELLOW],
  silver:      ['$', WHITE],
  copper:      ['$', MAROON]

}

let floors = []
let floor  = 1

// Use `RNG.create(seed)` to seed the RNG, where `seed` is some
// number like `7255.9743678451105`. Seeding the RNG allows you
// to achieve the same dungeon multiple times for debugging.
//
// Leave empty for a random seed.
//
const rng = RNG.create()

const attacks = ['bash', 'whack', 'mangle', 'tear apart', 'bite']

// TODO: Change these to key/value pairs with data on each enemy
const enemies = ['wyrm', 'slime']
function spawnEnemies(world) {
  let i = 10
  while (i--) {
    let kind = rng.choose(enemies)
    let options = { entityType: 'enemy', kind }
    let enemy = Entity.create(options)
    world.spawn(enemy)
  }
}

const money = {
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
    let { world, hero } = generate()
    let log = []

    if (world.rooms.secret.size)
      log.push('Something feels off about this dungeon...')
    else
      log.push(`Oh boy, a dungeon! Let's see what kinds of treasure we can find.`)

    world.on('door-opened', (entity, cell, secret) => {
      if (entity === hero)
        if (!secret)
          log.push('You open the door.')
        else
          log.push('You find a secret room!')
    })

    world.on('move', (entity, cell) => {
      if (entity === hero)
        if (world.getAt(cell) === STAIRS)
          log.push(`There's a set of stairs going down here.`)
    })

    world.on('attack', (entity, other) => {
      let attack = rng.choose(attacks)
      if (entity === hero)
        log.push(`You ${attack} the ${other.kind}!`)
    })

    world.on('item', (entity, item) => {
      if (entity === hero)
        if (item.itemType === 'money')
          log.push(`Found ${item.value} gold.`)
    })

    return { world, hero, log, debug: false }
  },
  methods: {
    onclick: function (target) {
      let {world, hero, debug, log} = this
      let cell = hero.cell

      if ( Cell.isEqual(cell, target) ) {
        if (world.getAt(cell) === STAIRS) {
          log.push(`You head downstairs.`)
          this.descend()
        }
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
      let log = this.log
      let { world, hero } = generate()

      if (world.rooms.secret.size)
        log.push('Something feels off about this dungeon...')

      world.on('door-opened', (entity, cell, secret) => {
        if (entity === hero)
          if (!secret)
            log.push('You open the door.')
          else
            log.push('You find a secret room!')
      })

      world.on('move', (entity, cell) => {
        if (entity === hero)
          if (world.getAt(cell) === STAIRS)
            log.push(`There's a set of stairs going down here.`)
      })

      world.on('attack', (entity, other) => {
        let attack = rng.choose(attacks)
        let punctuation = rng.choose( ['.', '!'] )
        if (entity === hero)
          log.push(`You ${attack} the ${other.kind}${punctuation}`)
      })

      world.on('item', (entity, item) => {
        if (entity === hero)
          if (item.itemType === 'money')
            log.push(`Found ${item.value} gold.`)
      })

      this.world = world
      this.hero  = hero
    }
  },
  computed: {
    view: function () {
      let {world, hero, debug} = this
      let view = []
      world.data.forEach((id, index) => {
        let cell, [cellX, cellY] = cell = Cell.fromIndex(index, WORLD_SIZE)
        let type = hero.known[cell]
        let char = ' ', color
        if (!type && debug)
          type = world.getTileAt(cell).name
        if (type) {
          if ( !(type in sprites) ) {
            throw new TypeError('Unrecognized sprite: ' + type)
          }
          [char, color] = sprites[type]
          if ( !hero.seeing[cell] )
            color = GRAY
          if ( Array.isArray(color) )
            color = `rgb(${color.join(', ')})`
        }
        // Outside brackets = all tiles are appended to the view
        //  Inside brackets = only tiles that are needed are appended
        let style = {
          color,
          // left: cellX + 'em',
          // top:  cellY + 'em'
        }
        let sprite = { char, style, cell }
        view.push(sprite)
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
    },
    log: {
      template: '#log-template',
      props: ['view']
    }
  }
})
