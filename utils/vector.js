var methods = function () {

  return { add, subtract, multiply, divide, scale, descale, clone, set, equals, magnitude, normalize, toString }

  function add(x, y) {
    if (!y && Array.isArray(x)) y = x[1], x = x[0]
    if (!y && typeof x === 'object') y = x.y, x = x.x
    this.x += x
    this.y += y
    return this
  }

  function subtract(x, y) {
    if (!y && Array.isArray(x)) y = x[1], x = x[0]
    if (!y && typeof x === 'object') y = x.y, x = x.x
    this.x -= x
    this.y -= y
    return this
  }

  function multiply(x, y) {
    if (!y && Array.isArray(x)) y = x[1], x = x[0]
    if (!y && typeof x === 'object') y = x.y, x = x.x
    this.x *= x
    this.y *= y
    return this
  }

  function divide(x, y) {
    if (!y && Array.isArray(x)) y = x[1], x = x[0]
    if (!y && typeof x === 'object') y = x.y, x = x.x
    this.x /= x
    this.y /= y
    return this
  }

  function scale(scalar) {
    this.x *= scalar
    this.y *= scalar
    return this
  }

  function descale(scalar) {
    this.x /= scalar
    this.y /= scalar
    return this
  }

  function clone() {
    return create(this)
  }

  function set(x, y) {
    if (!y && Array.isArray(x)) y = x[1], x = x[0]
    if (!y && typeof x === 'object') y = x.y, x = x.x
    this.x = x
    this.y = y
  }

  function equals(x, y) {
    if (!y && Array.isArray(x)) y = x[1], x = x[0]
    if (!y && typeof x === 'object') y = x.y, x = x.x
    return x === this.x && y === this.y
  }

  function magnitude() {
    var {x, y} = this
    return Math.sqrt(x * x + y * y)
  }

  function normalize() {
    var magnitude = this.magnitude()
    if (!magnitude) return Vector.create(0, 0)
    this.x /= magnitude, this.y /= magnitude
    return this
  }

  function toString() {
    return this.x + ',' + this.y
  }

}()

function create(x, y) {
  if (!y && Array.isArray(x)) y = x[1], x = x[0]
  if (!y && typeof x === 'object') y = x.y, x = x.x
  var vector = Object.create(methods)
  vector.x = x
  vector.y = y
  return vector
}

function equals(a, b) {
  a = normalize(a), b = normalize(b)
  return a.x === b.x && a.y === b.y
}

function normalize(x, y) {
  if (typeof y === 'undefined')
    if (Array.isArray(x))
      return { x: x[0], y: x[1] }
    else if (x)
      return x
    else
      return null
  return { x, y }
}

function toString(x, y) {
  if (!y && Array.isArray(x)) y = x[1], x = x[0]
  if (!y && typeof x === 'object') y = x.y, x = x.x
  return x + ',' + y
}

export default { create, equals, toString }
