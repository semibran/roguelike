import Vector from './vector'

export default { get }

function get(world, start, range) {
  var tiles = []
  var i = 8
  while (i--)
    tiles = tiles.concat( getOctant(world, start, range, i) )
  tiles.push( start.toString() )
  return tiles
}

function getOctant(world, start, range, octant) {
  var tiles = []
  var shadows = []
  var fullShadow = false
  for (var row = 1; row <= range; row++) {
    var pos = start.clone().add( transformOctant(row, 0, octant) )
    if ( !world.contains(pos) )
      break
    for (var col = 0; col <= row; col++) {
      pos = start.clone().add( transformOctant(row, col, octant) )
      if ( !world.contains(pos) )
        break
      var id = pos.toString()
      if (!fullShadow) {
        var projection = getProjection(row, col)
        var visible = !shadows.find( shadow => shadow.start <= projection.start && shadow.end >= projection.end )
        if (visible) {
          tiles.push(id)
          if ( world.tiles[ world.get(pos) ].opaque ) {
            for (var index = 0; index < shadows.length; index++)
              if (shadows[index].start >= projection.start)
                break
            var prev = shadows[index - 1]
            var next = shadows[index]
            var overPrev = index > 0 && prev.end > projection.start
            var overNext = index < shadows.length && next.start < projection.end
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
            var shadow = shadows[0]
            fullShadow = shadows.length === 1 && shadow.start === 0 && shadow.end === 1
          }
        }
      }
    }
  }
  return tiles
}

function getProjection(row, col) {
  var start = col / (row + 2)
  var end   = (col + 1) / (row + 1)
  return {start, end}
}

function transformOctant(row, col, octant) {
  switch (octant) {
    case 0: return Vector.create( col, -row)
    case 1: return Vector.create( row, -col)
    case 2: return Vector.create( row,  col)
    case 3: return Vector.create( col,  row)
    case 4: return Vector.create(-col,  row)
    case 5: return Vector.create(-row,  col)
    case 6: return Vector.create(-row, -col)
    case 7: return Vector.create(-col, -row)
  }
}
