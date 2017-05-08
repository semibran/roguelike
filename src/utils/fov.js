import { Cell } from './index'

export default { get }

function get(world, start, range) {
  let cells = []
  let i = 8
  while (i--)
    cells = cells.concat(getOctant(world, start, range, i))
  cells.push(start)
  return cells
}

function getOctant(world, start, range, octant) {
  range = range || Infinity
  let size = world.size
  let [x, y] = start
  let cells = []
  let shadows = []
  let fullShadow = false
  for (let row = 1; row <= range; row++) {
    let [transformX, transformY] = transformOctant(row, 0, octant)
    let cell = [x + transformX, y + transformY]
    if (!Cell.isInside(cell, size))
      break
    for (let col = 0; col <= row; col++) {
      let [transformX, transformY] = transformOctant(row, col, octant)
      let cell = [x + transformX, y + transformY]
      if (!Cell.isInside(cell, size) || transformX * transformX + transformY * transformY > range * range)
        break
      if (!fullShadow) {
        let projection = getProjection(row, col)
        let visible = !shadows.find(shadow => shadow.start <= projection.start && shadow.end >= projection.end)
        if (visible) {
          cells.push(cell)
          if (world.tileAt(cell).opaque) {
            let index
            for (index = 0; index < shadows.length; index++)
              if (shadows[index].start >= projection.start)
                break
            let prev = shadows[index - 1]
            let next = shadows[index]
            let overPrev = index > 0 && prev.end > projection.start
            let overNext = index < shadows.length && next.start < projection.end
            if (overNext)
              if (overPrev) {
                prev.end = next.end
                shadows.splice(index, 1)
              } else
                next.start = projection.start
            else
              if (overPrev)
                prev.end = projection.end
              else
                shadows.splice(index, 0, projection)
            let shadow = shadows[0]
            fullShadow = shadows.length === 1 && shadow.start === 0 && shadow.end === 1
          }
        }
      }
    }
  }
  return cells
}

function getProjection(row, col) {
  let start =  col      / (row + 2)
  let end   = (col + 1) / (row + 1)
  return {start, end}
}

function transformOctant(row, col, octant) {
  switch (octant) {
    case 0: return [ col, -row]
    case 1: return [ row, -col]
    case 2: return [ row,  col]
    case 3: return [ col,  row]
    case 4: return [-col,  row]
    case 5: return [-row,  col]
    case 6: return [-row, -col]
    case 7: return [-col, -row]
  }
}
