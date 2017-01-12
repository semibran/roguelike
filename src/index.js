import { Generator, World, Entity, Cell, Rect, Random } from './utils/index'

const WORLD_SIZE = 25
const {FLOOR, WALL, DOOR, DOOR_OPEN, STAIRS} = World

const sprites = {
  none: {},
  floor: {
    char: String.fromCharCode(183),
    color: 'olive'
  },
  wall: {
    char: '#',
    color: 'darkslategray'
  },
  door: {
    char: '+',
    color: 'sienna'
  },
  door_open: {
    char: '/',
    color: 'sienna'
  },
  stairs: {
    char: '>',
    color: 'white'
  },
  hero: {
    char: '@',
    color: 'white'
  }
}

function generate() {
  let world = Generator.createDungeon(WORLD_SIZE)
  let hero = Entity.create(sprites.hero)
  world.spawn(hero)
  world.spawn(STAIRS)
  return {world, hero}
}

new Vue({
  el: '#app',
  data: generate,
  methods: {
    onclick: function (index) {
      let {world, hero} = this
      let cell = hero.cell
      let targetX = index % WORLD_SIZE
      let targetY = (index - targetX) / WORLD_SIZE
      let target = [targetX, targetY]

      if ( Cell.isEqual(cell, target) ) {
        if (World.getAt(world.data, cell) === STAIRS) {
          this.descend()
        }
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
      let {world, hero} = this
      let view = []
      world.data.forEach((id, index) => {
        let cell = Cell.fromIndex(index, WORLD_SIZE)
        let char = ' '
        let color = 'gray'
        let tile = hero.known[cell]
        if (tile) {
          let sprite = sprites[tile]
          char = sprite.char
          if ( hero.seeing[cell] )
            color = sprite.color
        }
        view.push( {char, color} )
      })
      for (let entity of world.entities) {
        let index = Cell.toIndex(entity.cell, WORLD_SIZE)
        view[index] = entity.sprite
      }
      return view
    }
  },
  mounted: function () {
    this.$el.style.fontSize = `calc(100vmin / ${WORLD_SIZE})`
  },
  components: {
    game: {
      template: '#game-template',
      props: ['view', 'onclick']
    }
  }
})
