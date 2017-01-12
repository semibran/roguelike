import { Generator, World, Entity, Cell, Rect, Random } from './utils/index'

const WORLD_SIZE = 25
const {FLOOR, WALL, DOOR, DOOR_OPEN, DOOR_HIDDEN, STAIRS} = World

const sprites = {
  floor: {
    char: String.fromCharCode(183),
    color: 'white'
  },
  wall: {
    char: '#',
    color: 'teal'
  },
  door: {
    char: '+',
    color: 'yellow'
  },
  door_open: {
    char: '/',
    color: 'yellow'
  },
  door_hidden: {
    char: '#',
    color: 'teal'
  },
  stairs: {
    char: '>',
    color: 'white'
  },
  hero: {
    char: '@',
    color: 'white'
  },
  wyrm: {
    char: 'd',
    color: 'lime'
  },
  axolotl: {
    char: 'a',
    color: 'cyan'
  },
  lullaby: {
    char: 'o',
    color: 'green'
  },
  gatling: {
    char: 'G',
    color: 'white'
  },
  wasp: {
    char: 'b',
    color: 'yellow'
  },
  replica: {
    char: 'J',
    color: 'blue'
  }
}

const enemies = ['wyrm', 'axolotl', 'lullaby', 'gatling', 'wasp', 'replica']

function generate() {
  let world = Generator.createDungeon(WORLD_SIZE)
  let hero = Entity.create('hero', sprites.hero)
  world.spawn(STAIRS)
  world.spawn(hero)
  let i = 10
  while (i--) {
    let type = Random.choose(enemies)
    world.spawn( Entity.create(type, sprites[type]) )
  }
  for (let entity of world.entities)
    entity.look()
  return {world, hero}
}

new Vue({
  el: '#app',
  data: function () {
    return Object.assign(generate(), { debug: false })
  },
  methods: {
    onclick: function (index) {
      let {world, hero} = this
      let cell = hero.cell
      let targetX = index % WORLD_SIZE
      let targetY = (index - targetX) / WORLD_SIZE
      let target = [targetX, targetY]

      if ( Cell.isEqual(cell, target) ) {
        if (world.getAt(cell) === STAIRS)
          this.descend()
        return
      }

      if ( !hero.known[target] )
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
        let char = ' '
        let color = 'gray'
        let type = hero.known[cell]
        if (!type && debug)
          type = World.tiles[ world.getAt(cell) ].name
        if (type) {
          let sprite = sprites[type]
          char = sprite.char
          if ( hero.seeing[cell] )
            color = sprite.color
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
