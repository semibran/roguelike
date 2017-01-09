export default { isEqual, isIntersecting, getCorners, getEdges, getBorder, getCenter, getInside }

function isEqual(a, b) {
  var i = a.length
  while (i--)
    if (a[i] !== b[i])
      return false
  return true
}

function isIntersecting(a, b, exclusive) {
  let [ ax, ay, aw, ah ] = a
  let [ bx, by, bw, bh ] = b
  if (exclusive)
    ax--, ay--, aw += 2, ah += 2,
    bx--, by--, bw += 2, bh += 2
  return ax <= bx + bw && ay <= by + bh && ax + aw >= bx && ay + ah >= by
}

function getCorners(rect, exclusive) {
  var [ x, y, w, h ] = rect
  if (exclusive)
    x--, y--, w += 2, h += 2
  return [ [ x, y ], [ x + w, y ], [ x, y + h ], [ x + w, y + h ] ]
}

function getEdges(rect, exclusive) {
  var edges = []
  var [ x, y, w, h ] = rect
  var r = x + w, b = y + h, i
  if (exclusive)
    x--, y--, w += 2, h += 2
  for (i = x; i <= r; i++)
    edges.push( [ i, y ], [ i, b ] )
  for (i = y; i <= b; i++)
    edges.push( [ x, i ], [ r, i ] )
  return edges
}

function getBorder(rect, exclusive) {
  return getEdges(rect, exclusive).concat( getCorners(rect, exclusive) )
}

function getCenter(rect) {
  return [ Math.floor( rect[0] + rect[2] / 2 ), Math.floor( rect[1] + rect[3] / 2) ]
}

function getInside(rect) {
  var insides = []
  var [ x, y, w, h ] = rect
  var i = w * h
  while (i--) {
    var ix = i % w
    var iy = ( i - ix ) / w
    ix += x, iy += y
    insides[i] = [ ix, iy ]
  }
  return insides
}
