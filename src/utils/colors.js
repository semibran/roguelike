// High-contrast shades
const RED     = [255,   0,   0]
const YELLOW  = [255, 255,   0]
const LIME    = [  0, 255,   0]
const CYAN    = [  0, 255, 255]
const BLUE    = [  0,   0, 255]
const MAGENTA = [255,   0, 255]

// Darker ones
const MAROON = [128,   0,   0]
const OLIVE  = [128, 128,   0]
const GREEN  = [  0, 128,   0]
const TEAL   = [  0, 128, 128]
const NAVY   = [  0,   0, 128]
const PURPLE = [128,   0, 128]

// Monochromes
const WHITE = [255, 255, 255]
const GRAY  = [128, 128, 128]
const BLACK = [  0,   0,   0]

let lighter = {
  [MAROON]: RED,
   [OLIVE]: YELLOW,
   [GREEN]: LIME,
    [TEAL]: CYAN,
    [NAVY]: BLUE,
  [PURPLE]: MAGENTA,
    [GRAY]: WHITE,
   [BLACK]: GRAY
}
let darker  = {
      [RED]: MAROON,
   [YELLOW]: OLIVE,
     [LIME]: GREEN,
     [CYAN]: TEAL,
     [BLUE]: NAVY,
  [MAGENTA]: PURPLE,
    [WHITE]: GRAY,
     [GRAY]: BLACK
}

function lighten(color) {
  return lighter[color]
}

function darken(color) {
  return darker[color]
}

const constants = { RED, YELLOW, LIME, CYAN, BLUE, MAGENTA, MAROON, OLIVE, GREEN, TEAL, NAVY, PURPLE, WHITE, GRAY, BLACK }
const methods   = { lighten, darken }
export default Object.assign( {}, constants, methods )
