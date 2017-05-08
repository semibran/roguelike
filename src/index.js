import { Game, Display, Cell, World } from './utils/index'

const WORLD_SIZE = 25

const { LEFT, UP, RIGHT, DOWN } = Cell.directions
const { ENTRANCE, EXIT } = World.tileIds

const BLACK  = [  0,   0,   0]
const GRAY   = [128, 128, 128]
const SILVER = [192, 192, 192]
const WHITE  = [255, 255, 255]

const RED    = [255,   0,   0]
const MAROON = [128,   0,   0]

const YELLOW = [255, 255,   0]
const OLIVE  = [128, 128,   0]

const LIME   = [  0, 255,   0]
const GREEN  = [  0, 128,   0]

const BLUE   = [  0,   0, 255]
const NAVY   = [  0,   0, 128]

function darken(color) {
  switch (color) {
    case BLACK:  return BLACK
    case GRAY:   return GRAY
    case SILVER: return GRAY
    case WHITE:  return GRAY
    case RED:    return MAROON
    case MAROON: return MAROON
    case YELLOW: return OLIVE
    case OLIVE:  return OLIVE
    case LIME:   return GREEN
    case GREEN:  return GREEN
    case BLUE:   return NAVY
    case NAVY:   return NAVY
  }
  return null
}

function lighten(color) {
  switch (color) {
    case BLACK:  return GRAY
    case GRAY:   return SILVER
    case SILVER: return WHITE
    case WHITE:  return WHITE
    case RED:    return RED
    case MAROON: return RED
    case YELLOW: return YELLOW
    case OLIVE:  return YELLOW
    case LIME:   return LIME
    case GREEN:  return LIME
    case BLUE:   return BLUE
    case NAVY:   return BLUE
  }
  return null
}

const sprites = {
  floor:      BLACK,
  wall:       WHITE,
  door:       YELLOW,
  doorOpen:   OLIVE,
  doorSecret: WHITE,
  entrance:   GRAY,
  exit:       GREEN,
  human:      LIME,
  beast:      RED,
  item:       BLUE,
  corpse:     MAROON
}

let game = Game.create(WORLD_SIZE)
let display = Display.create(WORLD_SIZE).mount('#app')

console.log(game.rng.seed())

game
  .on(['start', 'tick'], render)

  .on('move', actor => {
    if (actor === game.hero)
      if (path)
        window.requestAnimationFrame(step)
  })

  .on('move-fail', actor => {
    if (actor === game.hero)
      if (path)
        path = null
  })

  .on('open', actor => {
    if (actor === game.hero)
      interrupted = true, path = null
  })

  .start()

let inputDirections = {

  KeyW:    UP,
  ArrowUp: UP,

  KeyA:      LEFT,
  ArrowLeft: LEFT,

  KeyS:      DOWN,
  ArrowDown: DOWN,

  KeyD:       RIGHT,
  ArrowRight: RIGHT

}

let interrupted = false // Door hack
window.addEventListener('keydown', event => {
  let { key, code } = event
  if (!interrupted && !path) {
    let direction = inputDirections[code]
    if (direction)
      game.input('move', direction)
    else if (key === 'c')
      game.input('close')
    else if (code === 'Space')
      game.input('wait')
    else if (key === '>')
      game.input('descend')
    else if (key === '<')
      game.input('ascend')
    else if (key === 'r')
      game.start()
  }
})

window.addEventListener('keyup', event => {
  interrupted = false
})

let canvas = display.context.canvas
let mouse = null
canvas.addEventListener('mousemove', event => {
  let { width, height } = canvas.getBoundingClientRect()
  let { offsetX, offsetY } = event
  mouse = [offsetX / width * canvas.width, offsetY / height * canvas.height].map(Math.floor)
  render(mouse)
})

let path = null
canvas.addEventListener('click', event => {
  if (!mouse)
    return
  if (path) {
    path = null
    return
  }
  let { world, cell, known } = game.hero
  if (Cell.isEqual(cell, mouse)) {
    let id = world.getAt(cell)
    if (id === ENTRANCE)
      game.input('ascend')
    else if (id === EXIT)
      game.input('descend')
    return
  }
  let cells = {}
  world.data.forEach((id, index) => {
    let cell = Cell.fromIndex(index, world.size)
    if (!known[game.floor][cell])
      cells[cell] = Infinity
  })
  path = world.findPath(cell, mouse, { cells })
  if (path)
    step()
})

canvas.addEventListener('mouseout', event => {
  mouse = null
})

function getView(actor) {
  let view = {}
  let { known, seeing } = actor
  known = known[game.floor]
  let cells = Object.keys(known).map(Cell.fromString)
  for (let cell of cells) {
    let name = known[cell]
    let color = sprites[name]
    if (!(cell in seeing))
      color = darken(color)
    view[cell] = color
  }
  return view
}

function render() {
  let view = getView(game.hero)
  if (mouse)
    view[mouse] = lighten(view[mouse])
  display.render(view)
}

function step() {
  let step = game.hero.world.findStep(path, game.hero.cell)
  if (!step) {
    path = null
    return false
  }
  game.input('move', step)
  return true
}
