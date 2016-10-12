module.exports = {
  is_equal: function(a, b) {
    return a[0] === b[0] && a[1] === b[1] && a[2] === b[2] && a[3] === b[3]
  },
  is_intersecting: function(a, b) {
    return a[0] <= b[2] && a[1] <= b[3] && a[2] >= b[0] && a[3] >= b[1]
  },
  get_corners: function(rect) {
    var top_left     = [rect[0] - 1, rect[1] - 1]
    var top_right    = [rect[2] + 1, rect[1] - 1]
    var bottom_left  = [rect[0] - 1, rect[3] + 1]
    var bottom_right = [rect[2] + 1, rect[3] + 1]
    return [top_left, top_right, bottom_left, bottom_right]
  },
  get_edges: function(rect) {
    var result = []
    var x, y, tile
    x = rect[0]
    while (x <= rect[2]) {
      result.push([x, rect[1] - 1])
      result.push([x, rect[3] + 1])
      x++
    }
    y = rect[1]
    while (y <= rect[3]) {
      result.push([rect[0] - 1, y])
      result.push([rect[2] + 1, y])
      y++
    }
    return result
  },
  get_border: function(rect) {
    var result = []
    var x, y, tile
    x = rect[0] - 1
    while (x <= rect[2] + 1) {
      result.push([x, rect[1] - 1])
      result.push([x, rect[3] + 1])
      x++
    }
    y = rect[1]
    while (y <= rect[3]) {
      result.push([rect[0] - 1, y])
      result.push([rect[2] + 1, y])
      y++
    }
    return result
  },
  get_center: function(rect) {
    return [(rect[0] + rect[2]) / 2, (rect[1] + rect[3]) / 2]
  },
  get_inside: function(rect) {
    var result = []
    y = rect[1]
    while (y <= rect[3]) {
      x = rect[0]
      while (x <= rect[2]) {
        result.push([x, y])
        x++
      }
      y++
    }
    return result
  }
}
