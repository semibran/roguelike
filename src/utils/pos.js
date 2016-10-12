module.exports = {
  // ------- MANIPULATION
  get_manhattan_distance: function(a, b) {
    return Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1])
  },

  add: function(a, b) {
    return [a[0] + b[0], a[1] + b[1]]
  },

  scale: function(pos, scale) {
    return [pos[0] * scale, pos[1] * scale]
  },

  normalize: function(pos) {
    return [pos[0] / Math.abs(pos[0]) || 0, pos[1] / Math.abs(pos[1]) || 0]
  },

  clone: function(pos) {
    return [pos[0], pos[1]]
  },

  // ------- CONVERSION
  to_pos: function(i, size) {
    var x = i % size
    return [x, (i - x) / size]
  },

  to_index: function(pos, size) {
    var x = pos[0]
    var y = pos[1]
    return x + (size * y)
  },

  // ------- CONDITION
  is_equal: function(a, b) {
    return a[0] === b[0] && a[1] === b[1]
  },

  is_edge: function(x, y, size) {
    var x = pos[0]
    var y = pos[1]
    return x === 0 || y === 0 || x === size - 1 || y == size - 1
  },

  is_inside: function(pos, size) {
    var x = pos[0]
    var y = pos[1]
    return x >= 0 && y >= 0 && x <= size - 1 && y <= size - 1
  }
}
