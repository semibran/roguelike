(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
module.exports = function(viewport_size) {
  return {
    template: "<div class='grid' :style='{ fontSize: \"calc(100vmin / " + viewport_size + ")\" }'>" +
                "<div class='overlay'></div>" +
                "<div class='tile' v-for='tile in view' v-html='tile.sprite' v-bind:title='[tile.id]' :class='[tile.type]' :style='{ color: tile.color }'></div>" +
              "</div>",
    props: ['view']
  }
}

},{}],2:[function(require,module,exports){
module.exports = {
  template: "<ul class='log'>" +
              "<li class='log-item' v-for='item in data'>{{ item }}</li>" +
            "</ul>",
  props: ['data']
}

},{}],3:[function(require,module,exports){
module.exports = {
  template: "<ul class='touchpad buttons'>" +
              "<li class='button-wrap'>" +
                "<button class='button' id='ArrowUp'></button>" +
              "</li>" +
              "<li class='button-wrap'>" +
                "<button class='button' id='ArrowRight'></button>" +
              "</li>" +
              "<li class='button-wrap'>" +
                "<button class='button' id='ArrowLeft'></button>" +
              "</li>" +
              "<li class='button-wrap'>" +
                "<button class='button' id='ArrowDown'></button>" +
              "</li>" +
            "</ul>"
}

},{}],4:[function(require,module,exports){
// Collaboration with Dustin Dowell

var debug = false
var omniscient = debug // ignore raycasting?
var scrolling  = !debug
var viewport_size = debug ? 25 : 9
var mobile = 'ontouchstart' in window || navigator.maxTouchPoints

var FOV     = require('./utils/fov')
var MAP     = require('./utils/map')
var PRESETS = require('./utils/presets')
var POS     = require('./utils/pos')
var RECT    = require('./utils/rect')
var RANDOM  = require('./utils/random')
var ELEMENT = require('./utils/element')

new Vue({
  el: '#app',
  data: {
    viewport_size: viewport_size,
    map_size: 25,
    map: null,
    player: null,
    log_data: [],
    mobile: mobile
  },
  computed: {
    log_view: function() {
      return this.log_data.slice(-5).reverse()
    },
    view: function () {
      var viewport_half = Math.floor(this.viewport_size / 2)
      var viewport_cntr = [viewport_half, viewport_half]
      var map_half = Math.floor(this.map_size / 2)
      var map_cntr = [map_half, map_half]
      var focus
      var player_tile

      if (!this.map) {
        this.map = this.create_map()
      }

      focus = scrolling ? this.player.pos : map_cntr

      if (!omniscient) {
        this.loop_through_tiles(this.player.visible, function(tile) { // Clear previously visible tiles
          tile.visible = false
        })
        this.player.visible = FOV.get(this.player.pos, this.player.vision, this.map, this.map_size) // Get new tiles
        this.loop_through_tiles(this.player.visible, function(tile) { // Display visible tiles
          tile.visible = true
        })
      }

      map = this.map_viewport(focus, this.map, this.map_size, this.viewport_size)

      var player_pos = viewport_cntr
      if (!scrolling)
        player_pos = this.player.pos
      map[POS.to_index(player_pos, this.viewport_size)] = {
        sprite: '@',
        color: 'white',
        type: 'player',
        id: 'Hey there!'
      }

      return map
    }
  },
  methods: {
    log: function(message) {
      this.log_data.push(message)
    },
    create_map: function() {
      var data = MAP.generate_map(RANDOM.choose(['dungeon', 'maze']), this.map_size)
      var map = data.map
      if (data.spawn)
        this.player = ELEMENT.create({ vision: Math.floor(viewport_size / 2) })(data.spawn, map)
      return map
    },
    change_floor: function() {
      this.map = this.create_map()
    },
    move_player: function (direction) {
      var tgt_x = this.player.pos[0] + direction[0]
      var tgt_y = this.player.pos[1] + direction[1]
      var tgt_pos = [tgt_x, tgt_y]
      var tgt_index
      var tgt_tile

      if (POS.is_inside(tgt_pos, this.map_size)) {

        tgt_index = POS.to_index(tgt_pos, this.map_size)
        tgt_tile = this.map[tgt_index]
        if (tgt_tile.walkable) {
          this.player.pos = tgt_pos
          if (tgt_tile.exit) {
            this.log("It's the stairs! Press . to descend.")
          }
          return true
        }
        if (tgt_tile.contact) {
          this.log('You open the door.')
          this.map[tgt_index] = PRESETS.get(tgt_tile.contact)
          this.player.pos = POS.clone(this.player.pos) // Force Vue refresh
        }
      }
      return false
    },
    loop_through_tiles: function(tiles, looper) {
      var pos, x, y, i, index, tile, tiles
      i = tiles.length
      while (i --) {
        pos = tiles[i]
        index = POS.to_index(pos, this.map_size)
        tile = this.map[index]
        if (tile)
          looper.call(this, tile)
        else
          throw pos
      }
    },
    // function map_viewport(pos, map, map_size, viewport_size) -> Array
    // > Cut `map` down to `viewport_size` with center `pos`
    map_viewport: function(center, map, map_size, viewport_size) {
      var viewport = []
      var i = 0, j
      var new_x, new_y, new_pos
      var index, tile, data
      var viewport_half = Math.floor(viewport_size / 2)
      var corner = [center[0] - viewport_half, center[1] - viewport_half]
      while(i < viewport_size) {
        j = 0
        while(j < viewport_size) {
          new_x = j + corner[0]
          new_y = i + corner[1]
          new_pos = [new_x, new_y]
          index = POS.to_index(new_pos, map_size)
          tile = null
          if (POS.is_inside(new_pos, map_size)) {

            tile = map[index]
          }
          if (!tile || !tile.visible && !omniscient) {
            data = {
              sprite: '&nbsp;',
              type: 'unknown'
            }
          } else {
            data = {
              sprite: tile.sprite,
              color: tile.color,
              type: tile.type
            }
          }
          data.id = '(' + new_x + ', ' + new_y + ')'
          // data.id = POS.to_index([new_x, new_y], map_size)
          viewport.push(data)
          j++
        }
        i++
      }

      return viewport
    }
  },
  mounted: function () {
    var that = this
    var key_pressed = {}
    var key_released = {}
    var movement_keys = ['KeyA', 'KeyW', 'KeyD', 'KeyS', 'ArrowLeft', 'ArrowUp', 'ArrowRight', 'ArrowDown', 'Period']
    this.log('Can you find the exit?')
    function handle_key(event) {
      var is_key_down = event.type === 'keydown'
      var code = event.code
      if (is_key_down) {
        if (!key_released[code]) {
          var first = !key_pressed[code]
          key_pressed[code] = true
          if (first) {
            loop()
          }
        }
      } else {
        key_pressed[code] = false
        key_released[code] = false
      }
    }
    function release_keys(keys) {
      keys.some(function(code) {
        key_pressed[code] = false
        key_released[code] = true
      })
    }
    window.addEventListener('keydown', handle_key)
    window.addEventListener('keyup',   handle_key)

    buttons_pressed = []

    function button_down(e) {
      var button = this
      button.classList.add('pressed')
      buttons_pressed.push(button)
      handle_key({
        code: button.id,
        type: 'keydown'
      })
    }
    function button_up(e) {
      if (buttons_pressed.length) {
        buttons_pressed.some(function(button) {
          button.classList.remove('pressed')
          handle_key({
            code: button.id,
            type: 'keyup'
          })
        })
        buttons_pressed = []
      }
    }

    var buttons = Array.prototype.slice.call(document.querySelectorAll('.touchpad .button'))
    buttons.some(function(button) {
      if (mobile) {
        button.addEventListener('touchstart', button_down);
        window.addEventListener('touchend',   button_up);
      } else {
        button.addEventListener('mousedown',  button_down);
        window.addEventListener('mouseup',    button_up);
      }
    })

    var timeout
    function loop() {
      window.clearTimeout(timeout)
      var dir_x = 0
      var dir_y = 0
      var moved, code
      var keys = []
      movement_keys.some(function(code) {
        if (key_pressed[code]) {
          keys.push(code)
        }
      })
      if (key_pressed.KeyA || key_pressed.ArrowLeft)  dir_x--
      if (key_pressed.KeyW || key_pressed.ArrowUp)    dir_y--
      if (key_pressed.KeyD || key_pressed.ArrowRight) dir_x++
      if (key_pressed.KeyS || key_pressed.ArrowDown)  dir_y++
      if (key_pressed.Period) {
        var index = POS.to_index(that.player.pos, that.map_size)
        var tile = that.map[index]
        if (tile.exit) {
          release_keys(keys)
          that.change_floor()
          that.log('You descend the staircase.')
          return
        }
      }
      if (dir_x !== 0 || dir_y !== 0) {
        moved = that.move_player([dir_x, dir_y])
        if (!moved) {
          release_keys(keys)
        }
      }
      timeout = window.setTimeout(loop, 1000 * .2)
    }
    loop()
  },
  components: {
    game:     require('./components/game')(viewport_size),
    log:      require('./components/log'),
    touchpad: require('./components/touchpad')
  }
})

},{"./components/game":1,"./components/log":2,"./components/touchpad":3,"./utils/element":5,"./utils/fov":6,"./utils/map":7,"./utils/pos":8,"./utils/presets":9,"./utils/random":10,"./utils/rect":11}],5:[function(require,module,exports){
module.exports = (function(){
  var POS = require('./pos')

  function create(attributes) {
    var element = {
      visible: []
    }
    for (var attribute in attributes) {
      element[attribute] = attributes[attribute]
    }
    return function create(pos) {
      element.pos = pos
      return element
    }
  }

  function move(element, direction) {
    var tgt = POS.add(element.pos, direction)
  }

  return {
    create: create,
    move: move
  }
}())

},{"./pos":8}],6:[function(require,module,exports){
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

},{"./pos":8}],7:[function(require,module,exports){
module.exports = (function() {
  // Directions
  var LEFT  = [-1, 0]
  var RIGHT = [ 1, 0]
  var UP    = [ 0,-1]
  var DOWN  = [ 0, 1]
  var directions = [LEFT, RIGHT, UP, DOWN]

  var POS     = require('./pos')
  var PRESETS = require('./presets')
  var RANDOM  = require('./random')
  var RECT    = require('./rect')

  var MAP = {
    TYPE_DUNGEON: 'dungeon',
    TYPE_MAZE:    'maze',
    TYPE_CAVE:    'cave',
    get_at: function(pos, map, size) {
      return map[POS.to_index(pos, size)]
    },
    get_converted_map: function(map) {
      var result = []
      var i = map.length
      var row, char
      while (i --) {
        result[i] = PRESETS.get_by_char(map[i])
      }
      return result
    },
    get_flattened_map: function(map, size) {
      var result = []
      var i = 0, imax = map.length, pos
      var row
      while (i < imax) {
        pos = POS.to_pos(i, size)
        if (pos[0] === 0)
          row = ""
        row += map[i]
        if (pos[0] === size - 1) {
          result.push(row)
        }
        i++
      }
      return result
    },
    get_map_ratio: function(map) {
      var total  = map.length + 1
      var others = 0
      var i = map.length
      while (i --)
        others += map[i] != '#' ? 1 : 0
      return others / total
    },
    get_neighbors: function(pos, map, size, scale) {
      scale = scale || 1
      var result = []
      var i = directions.length
      var direction, neighbor
      while (i--) {
        direction = directions[i]
        neighbor = POS.add(pos, POS.scale(direction, scale))
        if (POS.is_inside(neighbor, size)) {
          result.push(neighbor)
        }
      }
      return result
    },
    create_pathfinder: function(map, map_size, tile_costs) {
      function cache_distances() {
        var distance_map = {}
        var i, j, l = map.length
        var here, there

        i = l
        while (i--) {                              // Loop through map
          here = POS.to_pos(i, map_size)    // Get position at current index
          distance_map[here] = {}                  // Create distance map for this tile
          j = l
          while (j--) {                            // Loop through map (again?)
            there = POS.to_pos(j, map_size) // Get position at other index
            distance_map[here][there] = POS.get_manhattan_distance(here, there) // Get manhattan distance between the two points
          }
        }
        return distance_map
      }

      function sort_by_f(open_set, f_of) {
        open_set.sort(function(a, b) {
          return f_of[a] - f_of[b]
        })
      }

      function reconstruct_path(start, goal, get_parent) {
        var path = []
        var current = goal
        // console.log('Whew, we made it!')
        // throw "Warning: Entered danger zone."
        while (1) {
          path.unshift(current)
          parent = get_parent[current]
          if (parent) {
            current = parent
          } else {
            break
          }
        }
        if (POS.is_equal(current, start)) {
          return path
        } else {
          return null
        }
      }

      function get_neighbors(pos) {
        return MAP.get_neighbors(pos, map, map_size)
      }

      function get_at(pos) {
        return MAP.get_at(pos, map, map_size)
      }

      function open_cell(pos, set, in_set) {
        in_set[pos] = true
        set.push(pos)
      }

      function close_cell(pos, set, in_set) {
        in_set[pos] = true
        set.push(pos)
      }

      var distance_map = cache_distances()

      return function get_path(start, goal) {
        // console.log('Finding path from', start,'to', goal)

        var open_set = [start]
        var closed_set = []
        var in_open_set = {start: true}
        var in_closed_set = {}
        var get_parent = {}
        var f_of = {}
        var g_of = {}
        var distance_to_goal_from = distance_map[goal]
        var current

        var i = map.length
        while (i --) {
          current = POS.to_pos(i, map_size)
          g_of[current] = Infinity
          f_of[current] = Infinity
        }

        g_of[start] = 0
        f_of[start] = distance_to_goal_from[start]

        iters = 0
        while (open_set.length) {
          if (open_set.length > 1)
            sort_by_f(open_set, f_of)
          current = open_set.shift()
          // console.log('-- Current cell is',current)
          if (POS.is_equal(current, goal)) {
            return reconstruct_path(start, goal, get_parent)
          }
          close_cell(current, closed_set, in_closed_set)
          neighbors = get_neighbors(current)
          neighbors.some(function(neighbor) {
            if (in_closed_set[neighbor])
              return
            var tile = get_at(neighbor)
            var terrain_cost = tile_costs[tile] || 0
            var pos_cost = tile_costs[neighbor] || 0
            var cost = terrain_cost + pos_cost
            var g = (g_of[current] + 1) + cost
            if (!in_open_set[neighbor]) {
              open_cell(neighbor, open_set, in_open_set)
            } else if (g >= g_of[neighbor])
              return
            get_parent[neighbor] = current
            g_of[neighbor] = g
            f_of[neighbor] = g + distance_to_goal_from[neighbor]
            // console.log('Evaluating',neighbor)
            // console.log('- sprite char:',tile)
            // console.log('- tile cost of',cost)
            // console.log('- `h` score of',distance_to_goal_from[neighbor])
            // console.log('- `g` score of',g)
            // console.log('- `f` score of',f_of[neighbor])
          })
        }
        return null
      }
    },
    create_room_generator: function(min_size, max_size, map_size) {
      function get_room_size() {
        return RANDOM.get((max_size - min_size) / 2 + 1) * 2 + min_size
      }
      function get_room_pos(room_size) {
        return RANDOM.get((map_size - 2 - room_size) / 2) * 2 + 1
      }
      return function get_room() {
        var w = get_room_size()
        var h = get_room_size()
        var x = get_room_pos(w)
        var y = get_room_pos(h)
        return [x, y, x + w - 1, y + h - 1]
      }
    },
    generate_blank_map: function(size) {
      var map = []
      var i = size * size
      while (i --)
        map.push('#')
      return map
    },
    generate_box: function(size) {
      var map = []
      var i = 0
      var pos
      var area = size * size
      var pillar
      var char
      while(i < area) { // Fill map with walls
        pos = POS.to_pos(i, size)
        pillar = !(x % 4) && !(y % 4)
        if (POS.is_edge(pos, size) || pillar)
          char = '#'
        else
          char = '.'
        map.push(char)
        i++
      }
      return map
    },
    // function generate_maze(size) -> Array
    // > Generates a perfect maze (1-D array) of `size`.
    //
    // Here's a step-by-step guide of how it works:
    //  1. Fill map with walls
    //  2. Select random tile and add to stack
    //  3. While stack still has tiles...
    //    a. Pop tile from stack and mark it as visited
    //    b. If tile has unvisited adjacent neighbors...
    //      i.  Select random neighbor
    //      ii. Dig (replace walls with floors) from tile to neighbor
    //    c. If we've hit a dead end...
    //      i.  Backtrack!
    //  4. Return map
    //
    create_maze_generator: function(size) {
      return function generate_maze(raw) {
        console.log('Generating maze of size',size)
        var map = []
        var i = 0
        var x, y
        var area = size * size
        var replica = []
        var node, nodes = []
        var center = Math.floor(size / 2)
        while(i < area) { // Fill map with walls
          var pos = POS.to_pos(i, size)
          var type, tile
          tile = '#'
          map.push(tile)
          replica.push(pos)
          if ((pos[0] - 1) % 2 == 0 && (pos[1] - 1) % 2 == 0)
            nodes.push(pos)
          i++
        }

        function poke() {
          var x, y, pos, index
          do {
            x = RANDOM.get((size-2)/2)*2+1
            y = RANDOM.get((size-2)/2)*2+2
            pos = RANDOM.choose() ? [x, y] : [y, x]
            index = POS.to_index(pos, size)
          } while (map[index] !== '#')
          console.log(pos)
          map[index] = '.'
        }

        var start = RANDOM.choose(nodes)
        var spawn = POS.clone(start)
        var stack = [start]
        var tower = [start]
        var is_visited = {}
        var current
        var dist, dig
        var unvisited, neighbors, neighbor
        var ends = []
        var steps = 0
        console.log('from',start)
        while (stack.length) {
          current = stack.pop()
          is_visited[current] = true // Mark the current tile
          neighbors = MAP.get_neighbors(current, replica, size, 2)  // Get adjacent tiles (with a step of 2)
          unvisited = null
          unvisited = _.filter(neighbors, function(neighbor) {   // Filter out visited tiles
            return !is_visited[neighbor]
          })
          if (unvisited.length) {                                // If unvisited neighbors exist...
            neighbor = RANDOM.choose(unvisited)              // Get random valid neighbor
            dist = [neighbor[0] - current[0], neighbor[1] - current[1]]  // Get initial distance
            dig = POS.normalize(dist)             // Get dig step
            map[POS.to_index(current, size)] = '.'
            while (!POS.is_equal(current, neighbor)) { // While current !== target...
              current[0] += dig[0]                         // Move towards target
              current[1] += dig[1]
              map[POS.to_index(current, size)] = '.'
            }
            stack.push(neighbor)
            tower.push(neighbor)
            steps++
          } else {
            ends.push({
              pos: current,
              steps: steps
            })
            var top = tower.pop() // Backtrack
            top && stack.push(top)
            steps--
          }
        }
        ends.shift()
        ends.sort(function(a, b) {
          return b.steps - a.steps
        })
        map[POS.to_index(ends.shift().pos, size)] = '>'
        console.log('Exit is at',ends[0].pos)
        i = 2
        while (i--) poke()
        positions = []
        ends.some(function(obj) {
          positions.push(obj.pos)
        })
        return raw ? map : {
          spawn: spawn,
          enemies: positions,
          map: MAP.get_converted_map(map)
        }
      }
    },
    create_dungeon_generator: function(map_size) {
      return function generate_dungeon(raw) {
        var maze = MAP.create_maze_generator(map_size)(true)
        var map = MAP.generate_blank_map(map_size)
        var tile_costs = {
          '.': 0,
          '#': 1000,
          edge: 2000,
          corner: Infinity
        }
        var find_path = null
        var room, rooms = []
        var i = 0
        var tile, index, ratio
        var linked = {}

        function link_rooms(room_a, room_b) {
          if (!linked[room_a]) linked[room_a] = {}
          if (!linked[room_b]) linked[room_b] = {}
          linked[room_a][room_b] = true
          linked[room_b][room_a] = true
        }
        function dig_room(rect) {
          RECT.get_inside(rect).some(function(pos) {
            var index = POS.to_index(pos, map_size)
            map[index] = '.'
          })
        }
        function create_room(rects, rect) {
          var i, j, index
          var valid
          var other
          var attempts
          var get_room = MAP.create_room_generator(3, 7, map_size)
          if (!rects) {
            rects = []
          }
          attempts = []
          while (!rect && attempts < 3) {
            rect = get_room()
            if (rects.length) {
              i = rects.length
              valid = true
              while (i --) {
                other = rects[i]
                if (RECT.is_intersecting(rect, other)) {
                  valid = false
                  break
                }
              }
              if (!valid)
                rect = null
            }
            attempts ++
          }
          return rect
        }
        function create_rooms() {
          console.log('Creating rooms...')
          var ratio, room, rooms = []
          do {
            // ratio = MAP.get_map_ratio(map)
            if (room)
              rooms.push(room)
            if (!(rooms.length < map_size / 4 && /*ratio < .2 && */i < map_size))
              break
            room = create_room(rooms)
            i ++
          } while (1)
          return rooms
        }

        // i = maze.length
        // while (i--) {
        //   if (maze[i] === '.')
        //     map[i] = '!'
        // }

        rooms = create_rooms()
        rooms.some(function(room) {
          dig_room(room)
        })

        console.log('Created rooms',rooms)

        console.log('Caching room borders...')

        var room_edges    = {}
        var room_corners  = {}
        var room_centers  = {}
        var room_edge_list = []
        var room_corner_list = []
        var room_center_list = []
        var is_pos_edge   = {}
        var is_pos_corner = {}
        var is_pos_center = {}
        rooms.some(function(room) {
          var edges   = RECT.get_edges(room)
          var center  = RECT.get_center(room)
          var corners = RECT.get_corners(room)
          edges.some(function(tile) {
            is_pos_edge[tile] = true
            room_edge_list.push(tile)
            tile_costs[tile] = tile_costs.edge
          })
          corners.some(function(tile) {
            is_pos_corner[tile] = true
            room_corner_list.push(tile)
            tile_costs[tile] = tile_costs.corner
          })
          room_center_list.push(center)
          room_edges[room] = edges
          room_corners[room] = corners
          room_centers[room] = center
        })

        find_path = MAP.create_pathfinder(maze, map_size, tile_costs)

        console.log('Connecting rooms...')

        var evaluated = {}
        rooms.some(function(room_a) {
          if (!evaluated[room_a])
            evaluated[room_a] = {}
          var edges_a = room_edges[room_a]
          rooms.some(function(room_b) {
            if (!evaluated[room_b])
              evaluated[room_b] = {}
            if (!RECT.is_equal(room_a, room_b) && !evaluated[room_a][room_b] && !evaluated[room_b][room_a]) {
              var edges_b = room_edges[room_b]
              var seen = {}
              var shared_edges = []
              edges_a.some(function(edge) {
                seen[edge] = true
              })
              edges_b.some(function(edge) {
                if (seen[edge]) {
                  shared_edges.push(edge)
                }
              })
              var l = shared_edges.length
              if (l) {
                if (l == 1) {
                  var index = POS.to_index(shared_edges[0], map_size)
                  map[index] = '+'
                  link_rooms(room_a, room_b)
                } else {
                  // if (l === room_a[2] - room_a[0] + 1 ||
                  //     l === room_a[3] - room_a[1] + 1 ||
                  //     l === room_b[2] - room_b[0] + 1 ||
                  //     l === room_b[3] - room_b[1] + 1 ) {
                  //   shared_edges.some(function(edge) {
                  //     var index = POS.to_index(edge, map_size)
                  //     map[index] = '+'
                  //   })
                  // }
                }
              }
              evaluated[room_a][room_b] = true
              evaluated[room_b][room_a] = true
            }
          })
        })

        rooms.some(function(room) {
          if (!linked[room]) {
            console.log(room)
            var inside = RECT.get_inside(room)
            var center_a = room_centers[room]
            var center_b = null
            rooms.sort(function(room_a, room_b) {
              return POS.get_manhattan_distance(center_a, room_centers[room_a]) - POS.get_manhattan_distance(center_a, room_centers[room_b])
            })
            center_b = room_centers[rooms[1]]
            var path = find_path(center_a, center_b)
            if (path) {
             path.some(function(pos) {
               var index = POS.to_index(pos, map_size)
               var char = is_pos_edge[pos] ? '+' : '.'
               map[index] = char
             })
             var index = POS.to_index(center_a, map_size)
            //  map[index] = '!'
             link_rooms(room, rooms[1])
           } else {
             console.log('rip, no path found :(')
           }
          }
        })

        console.log('Identifying islands...')

        function get_islands() {
          var marked = {}
          var islands = []
          rooms.some(function(room) {
            var start = room_centers[room]
            var island, current, stack, index, char
            if (!marked[start]) {
              island = {
                room: room,
                contents: []
              }
              stack = [start]
              while (stack.length) {
                current = stack.pop()
                marked[current] = true
                island.contents.push(current)
                neighbors = MAP.get_neighbors(current, map, map_size)
                neighbors.some(function(neighbor) {
                  index = POS.to_index(neighbor, map_size)
                  char = map[index]
                  if (char !== '#' && !marked[neighbor])
                    stack.push(neighbor)
                })
              }
              islands.push(island)
            }
          })
          return islands
        }
        var islands = get_islands()

        console.log('Found',islands.length,'islands. Linking...')

        islands.some(function(island) {
          var room = island.room
          // console.log(room)
          var inside = RECT.get_inside(room)
          var center_a = room_centers[room]
          var center_b = null
          var unrelated = _.filter(rooms, function(other) {
            return !linked[other] || !linked[other][room] || !linked[room][other]
          })
          unrelated.sort(function(room_a, room_b) {
            return POS.get_manhattan_distance(center_a, room_centers[room_a]) - POS.get_manhattan_distance(center_a, room_centers[room_b])
          })
          var other = unrelated[1]
          center_b = room_centers[other]
          var path = find_path(center_a, center_b)
          if (path) {
           path.some(function(pos) {
             var index = POS.to_index(pos, map_size)
             var char = is_pos_edge[pos] ? '+' : '.'
             map[index] = char
           })
           var index = POS.to_index(center_a, map_size)
          //  map[index] = '!'
           link_rooms(room, other)
         } else {
           console.log('rip, no path found :(')
         }
        })

        console.log('Generation complete!')

        var spawn = null
        var exit = null
        var centers = []
        if (rooms.length) {
          var spawn = RECT.get_center(rooms[0])

          rooms.some(function(room, index) {
            if (index) {
              var center = RECT.get_center(room)
              centers.push({
                pos: center,
                dist: POS.get_manhattan_distance(spawn, center)
              })
            }
          })

          centers.sort(function(a, b) {
            return b.dist - a.dist
          })
          var index = POS.to_index(centers[0].pos, map_size)
          console.log(index)
          map[index] = '>'
        }

        var spawns = []

        return raw ? map : {
          rooms: rooms,
          spawn: spawn,
          map: MAP.get_converted_map(map)
        }
      }
    },
    generate_map: function(type, size) {
      var method = {
        'dungeon': MAP.create_dungeon_generator,
        'maze':    MAP.create_maze_generator
      }[type] || null
      return method ? method(size)() : null
    }
  }

  return MAP

}())

},{"./pos":8,"./presets":9,"./random":10,"./rect":11}],8:[function(require,module,exports){
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

},{}],9:[function(require,module,exports){
module.exports = (function() {
  var data = {
    'wall': {
      char: '#',//'&#x256c;',
      color: 'darkslategray',
      opaque: true
    },
    'floor': {
      char: '.',
      sprite: '&middot;',
      color: 'olive',
      walkable: true
    },
    'door': {
      char: '+',
      color: 'brown',
      opaque: true,
      contact: 'door-open'
    },
    'door-open': {
      char: '/',
      color: 'brown',
      walkable: true
    },
    'exit': {
      char: '>',
      color: 'white',
      walkable: true,
      exit: true
    },
    'debug': {
      char: '!',
      color: 'lime',
    }
  }
  var data_by_chars = {}
  var preset_name, preset
  for (preset_name in data) {
    preset = data[preset_name]
    preset.type = preset_name
    preset.sprite = preset.sprite || preset.char
    data_by_chars[preset.char] = preset
  }
  var PRESETS = {
    // function get_preset(type) -> Tile (Object)
    // > Gets a tile preset of `type`
    get: function(type) {
      var preset, result = {
        type: null,
        char: ' ',
        sprite: '&nbsp;',
        color: 'transparent',
        walkable: false,
        opaque: false,
        exit: false,
        visible: false,
        visited: false
      }
      if (!data.hasOwnProperty(type)) {
        console.log('Preset does not exist:',type)
      }
      preset = data[type]
      if (preset) {
        for (var attribute in preset) {
          result[attribute] = preset[attribute]
        }
      }
      return result
    },
    get_by_char: function(char) {
      var preset = data_by_chars[char]
      var result = PRESETS.get(preset.type)
      return result
    }
  }
  return PRESETS
}())

},{}],10:[function(require,module,exports){
module.exports = (function(){
  function get(min, max) {
    var a = arguments.length
    if (a === 0) {
      return Math.random()
    } else if (a === 1) {
      max = min
      min = 0
    }
    if (min > max) {
      var $ = min
      min = max
      max = $
    }
    return Math.floor(get() * (max - min)) + min
  }

  function choose(array) {
    var a = arguments.length
    if (a === 0 || !array.length)
      array = [0, 1]
    return array[get(array.length)]
  }

  return {
    get: get,
    choose: choose
  }
}())

},{}],11:[function(require,module,exports){
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

},{}]},{},[4])