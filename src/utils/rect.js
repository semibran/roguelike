export default { toString, fromString, isEqual, isIntersecting, getCorners, getEdges, getBorder, getCenter, getCells }

function toString(cell) {
  return cell.toString()
}

function fromString(string) {
  return string.split(',').map(Number)
}

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
  return [ [x, y], [x + w - 1, y], [x, y + h - 1], [x + w - 1, y + h - 1] ]
}

function getEdges(rect, exclusive) {
  var edges = []
  var [ x, y, w, h ] = rect
  var r = x + w, b = y + h, i
  if (exclusive)
    x--, y--, w += 2, h += 2
  for (i = x + 1; i < r; i++)
    edges.push( [ i, y ], [ i, b ] )
  for (i = y + 1; i < b; i++)
    edges.push( [ x, i ], [ r, i ] )
  return edges
}

function getBorder(rect, exclusive) {
  return getEdges(rect, exclusive).concat( getCorners(rect, exclusive) )
}

function getCenter(rect) {
  var x, y, w, h
  if ( Array.isArray(rect) ) {
    [x, y, w, h] = rect
    if (rect.length == 2)
      w = x, h = y, x = 0, y = 0
  } else if ( !isNaN(rect) )
    x = 0, y = 0, w = rect, h = rect
  return [ Math.floor(x + w / 2), Math.floor(y + h / 2) ]
}

function getCells(rect) {
  var cells = []
  var [ rectX, rectY, rectWidth, rectHeight ] = rect
  var i = rectWidth * rectHeight
  while (i--) {
    var x = i % rectWidth
    var y = (i - x) / rectWidth
    cells[i] = [x + rectX, y + rectY]
  }
  return cells
}
