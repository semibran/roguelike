module.exports = (function() {

  var POS = require('./pos')

  function get(pos, radius, map, map_size) {
    var method = ray_cast
    var result = method(pos, radius, map, map_size)
    return result
  }

  function ray_cast(pos, radius, map, map_size) { // Slow but precise
    var result = [], result_has = {}
    var i = 0, j
    var ray_tiles, tile
    var angle, precision = .5 // Adjust precision; gets faster and less accurate the closer you get to 0
    while (i < 360 * precision) {                                  // Modify angles by precision
      angle = i / precision                                        // Convert index back to 360-based angle
      ray_tiles = cast_ray(pos, angle, radius, map, map_size)      // Get list of tiles along angle-based ray
      for (j = ray_tiles.length; tile = ray_tiles[--j];) {         // Loop through ray tiles
        if (!result_has[tile]) {                                   // If we haven't seen this tile before... (filter out duplicates)
          result_has[tile] = true                                  // Mark it as seen
          result.push(tile)                                        // Add tile to visible tiles
        }
      }
      i++
    }
    return result
  }

  function cast_ray(pos, angle, distance, map, map_size) {
    var result = []
    var i = 1
    var new_x, new_y, new_pos, new_index, new_tile
    var radians = angle * Math.PI / 180
    var cos = Math.cos(radians)
    var sin = Math.sin(radians)
    while (i <= distance) {
      new_x = Math.round(pos[0] + cos * i)
      new_y = Math.round(pos[1] + sin * i)
      new_pos = [new_x, new_y]
      new_index = POS.to_index(new_pos, map_size)
      new_tile = map[new_index]
      if (!POS.is_inside(new_pos, map_size)) break
      result.push(new_pos)
      if (new_tile.opaque) break
      i ++
    }
    return result
  }

  function shadow_cast(x, y, radius, map, map_size) { // Supposedly faster but still has some nagging artifacts
    var result = []
    var result_has = {}
    var i, imax, j
    var raw_x, raw_y, raw_pos
    var rel_x, rel_y
    var new_x, new_y, new_pos
    var index, tile, valid
    var diameter, region
    var cos, sin, radians
    i = 0
    diameter = radius * 2 + 1
    region = diameter * diameter
    while (i < region) {
      raw_pos = POS.to_pos(i, diameter)
      raw_x = raw_pos[0]
      raw_y = raw_pos[1]
      rel_x = raw_x - radius + x
      rel_y = raw_y - radius + y
      // if (is_pos_edge(raw_x, raw_y, diameter)) {
        radians = Math.atan2(rel_y - y, rel_x - x)
        cos = Math.cos(radians)
        sin = Math.sin(radians)
        j = 0
        while(1) {
          new_x = Math.round(x + j * cos)
          new_y = Math.round(y + j * sin)
          new_pos = [new_x, new_y]
          if (POS.is_inside(new_pos, map_size)) {
            index = POS.to_index(new_pos, map_size)
            tile = map[index]
            if (!result_has[new_pos]) {
              result_has[new_pos] = true
              result.push([new_x, new_y])
            }
            if (j >= radius || POS.is_equal(new_pos, rel_pos) || tile.opaque) {
              break
            }
          }
          j ++
        }
      // }
      i ++
    }
    return result
  }

  return {
    get: get
  }

}())
