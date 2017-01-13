import { Dungeon, World, Entity, Cell, Rect, RNG } from './utils/index'

const WORLD_SIZE = 25
const { FLOOR, WALL, DOOR, DOOR_OPEN, DOOR_HIDDEN, STAIRS, TRAP } = World

let Colors = function () {

  let lighter = {}
  let darker  = {}

  function lighten(color) {
    return null
  }

  function darken(color) {
    return null
  }

  return {

    // High-contrast shades
    RED:     [255,   0,   0],
    YELLOW:  [255, 255,   0],
    LIME:    [  0, 255,   0],
    CYAN:    [  0, 255, 255],
    BLUE:    [  0,   0, 255],
    MAGENTA: [255,   0, 255],

    // Darker ones
    MAROON: [128,   0,   0],
    OLIVE:  [128, 128,   0],
    GREEN:  [  0, 128,   0],
    TEAL:   [  0, 128, 128],
    NAVY:   [  0,   0, 128],
    PURPLE: [128,   0, 128],

    // Monochromes
    WHITE: [255, 255, 255],
    GRAY:  [128, 128, 128],
    BLACK: [  0,   0,   0],

    lighten, darken

  }

}()

const { RED, MAROON, YELLOW, OLIVE, LIME, GREEN, CYAN, TEAL, BLUE, NAVY, MAGENTA, PURPLE, WHITE, GRAY, BLACK } = Colors

const sprites = {
  floor:       [String.fromCharCode(183), TEAL],
  wall:        ['#', OLIVE],
  door:        ['+', MAROON],
  door_open:   ['/', MAROON],
  door_secret: ['#', OLIVE],
  stairs:      ['>', WHITE],
  trap:        ['^', MAGENTA],
  hero:        ['@', WHITE],
  wyrm:        ['w', LIME],
  replica:     ['J', BLUE]
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

function generate() {
  let world = Dungeon.create(WORLD_SIZE, rng)
  let hero = Entity.create('hero', sprites.hero)
  world.spawn(STAIRS, 'center')
  world.spawn(TRAP)
  world.spawn(hero)
  let i = 10
  while (i--) {
    let type = rng.choose(enemies)
    world.spawn( Entity.create(type, sprites[type]) )
  }
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
